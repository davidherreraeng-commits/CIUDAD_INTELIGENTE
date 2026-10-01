const { AZURE_CONTRACTS } = require('../../config/azure-contracts.config');
const azureBalances = require('./azure-balances.service');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Convierte "YYYY-MM-DD" a Date en medianoche hora Colombia (-05:00).
 */
const toDate = (value) => new Date(`${value}T00:00:00-05:00`);

const addDays = (date, days) => new Date(date.getTime() + days * MS_PER_DAY);

const diffInDays = (start, end) => Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);

const toIsoDate = (date) => date.toISOString().split('T')[0];

const pad2 = (n) => String(n).padStart(2, '0');

const parseYearMonthDay = (value) => value.split('-').map(Number);

/**
 * true si [startDate, endDate] es exactamente un mes calendario completo
 * (día 1 hasta el último día del mismo mes).
 */
const isFullCalendarMonth = (startDate, endDate) => {
  const [sy, sm, sd] = parseYearMonthDay(startDate);
  const [ey, em, ed] = parseYearMonthDay(endDate);
  if (sy !== ey || sm !== em || sd !== 1) return false;
  const lastDay = new Date(ey, em, 0).getDate();
  return ed === lastDay;
};

/**
 * Consumo y créditos de un contrato: TODO sale de la Balances API real de
 * Azure (Microsoft.Consumption/balances) — nada de CSV del blob ni
 * aproximaciones. Requiere AZURE_TENANT_ID/AZURE_CLIENT_ID/
 * AZURE_CLIENT_SECRET configurados y el App Registration con rol
 * EnrollmentReader sobre el enrollment (ver "Paso a paso - App
 * Registration balance Azure.md").
 *
 * Si la llamada falla (credenciales faltantes, token inválido, rol sin
 * propagar todavía, etc.) el contrato queda con todos los campos en null y
 * `errorBalancesApi` con el motivo exacto — no se aproxima nada.
 */
const describeAxiosError = (error) => {
  if (error.response) {
    const azureMessage = error.response.data?.error?.message || JSON.stringify(error.response.data);
    return `HTTP ${error.response.status}: ${azureMessage}`;
  }
  return error.message;
};

const getBalancesForRange = async (billingAccountId, start, endInclusive, label) => {
  try {
    const data = await azureBalances.getRealCreditsForContract(billingAccountId, start, endInclusive);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: describeAxiosError(error) };
  }
};

/**
 * Calcula, para un contrato, el consumo y créditos del periodo pedido y del
 * periodo anterior de igual duración — ambos directo de la Balances API.
 */
const calculateContractCredits = async (contract, start, endDateInclusive, prevStart, prevEndInclusive) => {
  if (!azureBalances.isConfigured()) {
    return buildErrorResult(contract, 'AZURE_TENANT_ID/AZURE_CLIENT_ID/AZURE_CLIENT_SECRET no configurados en el .env del api');
  }

  const [actual, anterior] = await Promise.all([
    getBalancesForRange(contract.billingAccountId, start, endDateInclusive),
    getBalancesForRange(contract.billingAccountId, prevStart, prevEndInclusive),
  ]);

  if (actual.error) {
    console.error(`[azure-credits] Falló la Balances API para ${contract.numeroContrato} (${contract.billingAccountId}): ${actual.error}`);
    return buildErrorResult(contract, actual.error);
  }

  return {
    numeroContrato: contract.numeroContrato,
    billingAccountId: contract.billingAccountId,
    fechaVencimiento: contract.fechaVencimiento,
    fuenteCreditos: 'balances-api',
    errorBalancesApi: null,
    // Consumo del periodo = "utilized" de la Balances API (créditos aplicados a cargos)
    consumoPeriodo: actual.data.utilized,
    consumoPeriodoAnterior: anterior.data ? anterior.data.utilized : null,
    creditosDisponiblesInicio: actual.data.beginningBalance,
    creditosDisponiblesFin: actual.data.endingBalance,
    nuevosCreditos: actual.data.newPurchases,
    ajustes: actual.data.adjustments,
  };
};

const buildErrorResult = (contract, errorMessage) => ({
  numeroContrato: contract.numeroContrato,
  billingAccountId: contract.billingAccountId,
  fechaVencimiento: contract.fechaVencimiento,
  fuenteCreditos: 'error',
  errorBalancesApi: errorMessage,
  consumoPeriodo: null,
  consumoPeriodoAnterior: null,
  creditosDisponiblesInicio: null,
  creditosDisponiblesFin: null,
  nuevosCreditos: null,
  ajustes: null,
});

/**
 * Resumen de consumo y créditos por contrato para un rango de fechas, más
 * comparación contra el periodo inmediatamente anterior de igual duración.
 * Todo sale de la Balances API real — sin CSV, sin aproximaciones.
 *
 * @param {string} startDate - "YYYY-MM-DD" (inclusiva)
 * @param {string} endDate - "YYYY-MM-DD" (inclusiva)
 */
const getContractsCreditsSummary = async (startDate, endDate) => {
  const start = toDate(startDate);
  const end = toDate(endDate);
  const periodDays = diffInDays(start, addDays(end, 1));

  let prevStart;
  let prevEnd;

  if (isFullCalendarMonth(startDate, endDate)) {
    // La Balances API trabaja por mes calendario completo (ver
    // getRealCreditsForContract): pedirle "N días antes" del inicio del
    // periodo actual no calza con el mes calendario anterior cuando los
    // meses tienen distinta cantidad de días (ej. comparar marzo (31 días)
    // contra "31 días antes" del 1 de marzo cae en enero, no en febrero), y
    // eso hace que el periodo anterior sume de más (dos meses en vez de
    // uno). Si el rango pedido es un mes calendario completo, el periodo
    // anterior debe ser exactamente el mes calendario inmediatamente previo.
    const [sy, sm] = parseYearMonthDay(startDate);
    const prevMonthDate = new Date(sy, sm - 2, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth() + 1;
    const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
    prevStart = toDate(`${prevYear}-${pad2(prevMonth)}-01`);
    prevEnd = toDate(`${prevYear}-${pad2(prevMonth)}-${pad2(prevLastDay)}`);
  } else {
    prevEnd = addDays(start, -1);
    prevStart = addDays(start, -periodDays);
  }

  const prevPeriodDays = diffInDays(prevStart, addDays(prevEnd, 1));

  const contratos = await Promise.all(
    AZURE_CONTRACTS.map((contract) => calculateContractCredits(contract, start, end, prevStart, prevEnd))
  );

  const todosOk = contratos.every((c) => c.fuenteCreditos === 'balances-api');

  const sumIfAllOk = (key) => (todosOk ? contratos.reduce((acc, c) => acc + (c[key] || 0), 0) : null);

  const consumoTotalPeriodo = sumIfAllOk('consumoPeriodo');
  const consumoTotalPeriodoAnterior = sumIfAllOk('consumoPeriodoAnterior');
  const creditosDisponiblesTotalInicio = sumIfAllOk('creditosDisponiblesInicio');
  const creditosDisponiblesTotalFin = sumIfAllOk('creditosDisponiblesFin');

  const variacionAbsoluta = (consumoTotalPeriodo !== null && consumoTotalPeriodoAnterior !== null)
    ? consumoTotalPeriodo - consumoTotalPeriodoAnterior
    : null;
  const variacionPorcentual = (variacionAbsoluta !== null && consumoTotalPeriodoAnterior > 0)
    ? (variacionAbsoluta / consumoTotalPeriodoAnterior) * 100
    : null;

  const contratosConParticipacion = contratos.map((c) => ({
    ...c,
    porcentajeParticipacion: (todosOk && consumoTotalPeriodo > 0)
      ? (c.consumoPeriodo / consumoTotalPeriodo) * 100
      : null,
  }));

  return {
    periodo: { startDate, endDate, dias: periodDays },
    periodoAnterior: {
      startDate: toIsoDate(prevStart),
      endDate: toIsoDate(prevEnd),
      dias: prevPeriodDays,
      consumoTotal: consumoTotalPeriodoAnterior,
    },
    contratos: contratosConParticipacion,
    totales: {
      consumoPeriodo: consumoTotalPeriodo,
      creditosDisponiblesInicio: creditosDisponiblesTotalInicio,
      creditosDisponiblesFin: creditosDisponiblesTotalFin,
      variacionAbsoluta,
      variacionPorcentual,
    },
  };
};

const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Genera los últimos `monthsBack` meses (year, month 1-12) terminando en
 * (e inclusive de) endYear/endMonth, en orden cronológico.
 */
const lastMonths = (endYear, endMonth, monthsBack) => {
  const months = [];
  const cursor = new Date(endYear, endMonth - 1, 1);
  cursor.setMonth(cursor.getMonth() - (monthsBack - 1));

  for (let i = 0; i < monthsBack; i++) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
};

/**
 * Tendencia de consumo ("utilized" de la Balances API) de los últimos N
 * meses calendario (por defecto 6), terminando en el mes/año pedido, por
 * contrato y total. Todo real, sin CSV.
 */
const getConsumptionTrend = async (endYear, endMonth, monthsBack = 6) => {
  if (!azureBalances.isConfigured()) {
    return { meses: [], error: 'AZURE_TENANT_ID/AZURE_CLIENT_ID/AZURE_CLIENT_SECRET no configurados en el .env del api' };
  }

  const months = lastMonths(endYear, endMonth, monthsBack);

  const porContrato = await Promise.all(
    AZURE_CONTRACTS.map(async (contract) => {
      const valores = await Promise.all(
        months.map(({ year, month }) =>
          azureBalances.getMonthlyBalance(contract.billingAccountId, year, month)
            .then((b) => Number.parseFloat(b.utilized) || 0)
            .catch(() => null)
        )
      );
      return { numeroContrato: contract.numeroContrato, valores };
    })
  );

  const meses = months.map(({ year, month }, i) => {
    const valoresDelMes = porContrato.map((c) => c.valores[i]);
    const algunoFallo = valoresDelMes.some((v) => v === null);
    return {
      label: `${MONTH_LABELS[month - 1]} ${year}`,
      year,
      month,
      consumoTotal: algunoFallo ? null : valoresDelMes.reduce((acc, v) => acc + v, 0),
    };
  });

  return {
    meses,
    contratos: porContrato.map((c) => ({
      numeroContrato: c.numeroContrato,
      valores: c.valores,
    })),
    error: null,
  };
};

module.exports = {
  getContractsCreditsSummary,
  calculateContractCredits,
  getConsumptionTrend,
};
