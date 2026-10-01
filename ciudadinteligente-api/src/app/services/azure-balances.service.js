const axios = require('axios');
const AzureBalanceCache = require('../../infrastructure/models/projects/azure-balance-cache.model');

/**
 * Cliente de la Balances API real de Azure (Microsoft.Consumption/balances).
 *
 * Requiere un App Registration en Microsoft Entra ID con rol
 * "EnrollmentReader" asignado sobre cada enrollment (ver "Paso a paso - App
 * Registration balance Azure.md"). Variables de entorno necesarias:
 *   AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET
 *
 * Documentación oficial:
 * https://learn.microsoft.com/en-us/rest/api/consumption/balances/get-by-billing-account
 * https://learn.microsoft.com/en-us/rest/api/consumption/balances/get-for-billing-period-by-billing-account
 */

const API_VERSION = '2024-08-01';

const isConfigured = () =>
  Boolean(process.env.AZURE_TENANT_ID && process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET);

// Cache simple del token en memoria (dura ~1h, lo renovamos con margen).
let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiresAt) {
    return cachedToken;
  }

  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', 'https://management.azure.com/.default');

  const response = await axios.post(tokenUrl, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  cachedToken = response.data.access_token;
  // Restamos 2 minutos de margen para no usar un token a punto de vencer.
  cachedTokenExpiresAt = now + (response.data.expires_in - 120) * 1000;

  return cachedToken;
}

/**
 * Balance actual (se actualiza a diario si el periodo sigue abierto).
 */
async function getCurrentBalance(billingAccountId) {
  const token = await getAccessToken();
  const url = `https://management.azure.com/providers/Microsoft.Billing/billingAccounts/${billingAccountId}/providers/Microsoft.Consumption/balances?api-version=${API_VERSION}`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.properties;
}

/**
 * Balance de un mes específico ya cerrado. billingPeriodName tiene formato
 * "YYYYMM", ej. "202606" para junio 2026.
 */
async function getBalanceForBillingPeriod(billingAccountId, billingPeriodName) {
  const token = await getAccessToken();
  const url = `https://management.azure.com/providers/Microsoft.Billing/billingAccounts/${billingAccountId}/billingPeriods/${billingPeriodName}/providers/Microsoft.Consumption/balances?api-version=${API_VERSION}`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.properties;
}

/**
 * Genera la lista de billingPeriodName ("YYYYMM") entre dos fechas, inclusive.
 */
function billingPeriodsBetween(start, end) {
  const periods = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= last) {
    const year = cursor.getFullYear();
    const month = String(cursor.getMonth() + 1).padStart(2, '0');
    periods.push(`${year}${month}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return periods;
}

function isCurrentBillingPeriod(billingPeriodName) {
  const now = new Date();
  const current = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return billingPeriodName === current;
}

// Cuánto tiempo se sirve el balance del MES VIGENTE desde la BD antes de
// volver a consultar la Balances API real. Los meses ya cerrados no usan
// este TTL — una vez guardados en BD no se vuelven a consultar (un mes
// cerrado no cambia).
const CURRENT_PERIOD_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 día

// Si varias consultas simultáneas encuentran el caché vencido (o
// inexistente) para el mismo contrato+mes, todas esperan la MISMA promesa en
// curso en vez de disparar una llamada a Azure cada una — esto es lo que
// evita que la Balances API se sature/caiga cuando entran varios usuarios
// al reporte al mismo tiempo.
const inFlightBalanceFetches = new Map();

const balanceCacheRowToPlain = (row) => ({
  beginningBalance: Number.parseFloat(row.beginningBalance) || 0,
  endingBalance: Number.parseFloat(row.endingBalance) || 0,
  newPurchases: Number.parseFloat(row.newPurchases) || 0,
  adjustments: Number.parseFloat(row.adjustments) || 0,
  utilized: Number.parseFloat(row.utilized) || 0,
  currency: row.currency || 'USD',
});

async function fetchFreshAndCache(billingAccountId, billingPeriodName) {
  const key = `${billingAccountId}|${billingPeriodName}`;

  if (inFlightBalanceFetches.has(key)) {
    return inFlightBalanceFetches.get(key);
  }

  const fetchPromise = (async () => {
    const fresh = isCurrentBillingPeriod(billingPeriodName)
      ? await getCurrentBalance(billingAccountId)
      : await getBalanceForBillingPeriod(billingAccountId, billingPeriodName);

    try {
      await AzureBalanceCache.upsert({
        billingAccountId,
        billingPeriodName,
        beginningBalance: fresh.beginningBalance || 0,
        endingBalance: fresh.endingBalance || 0,
        newPurchases: fresh.newPurchases || 0,
        adjustments: fresh.adjustments || 0,
        utilized: fresh.utilized || 0,
        currency: fresh.currency ? fresh.currency.trim() : 'USD',
      });
    } catch (cacheError) {
      // Si falla el guardado en caché no tumbamos la consulta — el dato
      // fresco de Azure ya lo tenemos y es lo que le importa al usuario.
      console.error(`[azure-balances] No se pudo guardar en caché ${key}: ${cacheError.message}`);
    }

    return fresh;
  })();

  inFlightBalanceFetches.set(key, fetchPromise);

  try {
    return await fetchPromise;
  } finally {
    inFlightBalanceFetches.delete(key);
  }
}

/**
 * Balance de un contrato+mes (billingPeriodName "YYYYMM"), con caché en la
 * tabla tbl_azure_balances de la BD de billing:
 *   - Mes cerrado ya cacheado: se sirve directo de BD, nunca se vuelve a
 *     consultar Azure.
 *   - Mes vigente cacheado hace menos de 1 día: se sirve de BD.
 *   - Mes vigente cacheado hace más de 1 día, o sin caché: se consulta Azure y
 *     se actualiza/crea la fila en BD.
 * Si la BD de billing falla al leer el caché, no se rompe la consulta: se
 * cae a pedirle el dato directo a Azure.
 */
async function getCachedBalance(billingAccountId, billingPeriodName) {
  let cached = null;

  try {
    cached = await AzureBalanceCache.findOne({ where: { billingAccountId, billingPeriodName } });
  } catch (readError) {
    console.error(`[azure-balances] No se pudo leer caché de ${billingAccountId}/${billingPeriodName}: ${readError.message}`);
  }

  if (cached) {
    const esVigente = isCurrentBillingPeriod(billingPeriodName);
    const vencido = esVigente && (Date.now() - new Date(cached.updatedAt).getTime()) > CURRENT_PERIOD_CACHE_TTL_MS;

    if (!vencido) {
      return balanceCacheRowToPlain(cached);
    }
  }

  return fetchFreshAndCache(billingAccountId, billingPeriodName);
}

/**
 * Créditos reales para un contrato (billingAccountId) entre dos fechas.
 * Como la Balances API trabaja por mes calendario completo, se consulta
 * cada mes que toca el rango pedido y se combinan:
 *   - beginningBalance: la del primer mes del rango
 *   - endingBalance: la del último mes (usa el balance "actual" si ese mes
 *     sigue abierto, porque se actualiza a diario)
 *   - newPurchases / adjustments / utilized: suma de todos los meses del rango
 */
async function getRealCreditsForContract(billingAccountId, startDate, endDate) {
  const periods = billingPeriodsBetween(startDate, endDate);

  const balancesByPeriod = await Promise.all(
    periods.map((periodName) => getCachedBalance(billingAccountId, periodName))
  );

  const first = balancesByPeriod[0];
  const last = balancesByPeriod[balancesByPeriod.length - 1];

  const sum = (key) => balancesByPeriod.reduce((acc, b) => acc + (Number.parseFloat(b[key]) || 0), 0);

  return {
    beginningBalance: Number.parseFloat(first.beginningBalance) || 0,
    endingBalance: Number.parseFloat(last.endingBalance) || 0,
    newPurchases: sum('newPurchases'),
    adjustments: sum('adjustments'),
    utilized: sum('utilized'),
    currency: last.currency ? last.currency.trim() : 'USD',
  };
}

/**
 * Balance de un mes calendario específico (year, month 1-12). Usa el balance
 * "actual" si ese mes es el mes en curso (se actualiza a diario), o el de
 * billingPeriods si ya cerró.
 */
async function getMonthlyBalance(billingAccountId, year, month) {
  const billingPeriodName = `${year}${String(month).padStart(2, '0')}`;

  return getCachedBalance(billingAccountId, billingPeriodName);
}

module.exports = {
  isConfigured,
  getRealCreditsForContract,
  getCurrentBalance,
  getBalanceForBillingPeriod,
  getMonthlyBalance,
  getCachedBalance,
};
