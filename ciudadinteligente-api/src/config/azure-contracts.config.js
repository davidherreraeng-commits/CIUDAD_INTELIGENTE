/**
 * Configuración de contratos de Azure (Enterprise Agreement).
 *
 * Por qué existe este archivo:
 * Azure NO incluye el balance de créditos disponibles en las "Exports" de
 * Cost Management que procesa el worker (ver "Solicitud - Créditos Azure.md").
 * Esa información solo la entrega la Balances API, que requiere un
 * App Registration con rol EnrollmentReader (ver "Paso a paso - App
 * Registration balance Azure.md") — trámite pendiente, no automatizado hoy.
 *
 * Mientras tanto, cada contrato tiene un monto total de créditos fijo,
 * asignado al firmarse. Se puede calcular el crédito disponible en
 * cualquier momento así:
 *
 *   creditosDisponibles(fecha) = totalCreditosUSD - SUM(billedCost elegible
 *                                 para crédito) acumulado desde el inicio
 *                                 del contrato hasta esa fecha
 *
 * Cuando se resuelva la integración con la Balances API, este archivo deja
 * de ser la fuente de verdad para "disponible" y pasa a usarse solo como
 * fallback (o se elimina).
 *
 * `blobPrefix` es la carpeta del contenedor de Blob Storage donde Azure deja
 * los CSV de ese contrato (las mismas carpetas que ya usa
 * ciudadinteligente-worker). El api lee esos CSV directamente — no depende
 * de tbl_billing ni de que el worker haya corrido — para poder capturar
 * todas las columnas del export (incluida `x_SkuIsCreditEligible`, clave
 * para saber qué cargos sí descuentan del balance de créditos EA).
 *
 * `billingAccountId` es el número de enrollment EA (viene en la columna
 * BillingAccountId del CSV: ".../billingAccounts/<id>"), se deja aquí solo
 * como referencia/documentación de a qué enrollment corresponde cada carpeta.
 */

const AZURE_CONTRACTS = [
  {
    numeroContrato: '4600105301',
    billingAccountId: '51785921',
    blobPrefix: 'export-Subinnovaciondigital/',
    bolsaOrigen: 'Subinnovaciondigital',
    totalCreditosUSD: 217249.35,
    fechaInicio: '2024-01-01', // Ajustar a la fecha real de inicio del contrato
    fechaVencimiento: '2026-08-31',
  },
  {
    numeroContrato: '4600105602',
    billingAccountId: '60032519',
    blobPrefix: 'export-SubInnovacionDigital_Suscripciones/',
    bolsaOrigen: 'SubInnovacionDigital_Suscripciones',
    totalCreditosUSD: 214366.50,
    fechaInicio: '2024-01-01', // Ajustar a la fecha real de inicio del contrato
    fechaVencimiento: '2028-08-31',
  },
];

const getContractByBolsa = (bolsaOrigen) =>
  AZURE_CONTRACTS.find((c) => c.bolsaOrigen === bolsaOrigen);

const getContractByBillingAccountId = (billingAccountId) =>
  AZURE_CONTRACTS.find((c) => c.billingAccountId === billingAccountId);

const getContractByNumero = (numeroContrato) =>
  AZURE_CONTRACTS.find((c) => c.numeroContrato === numeroContrato);

module.exports = {
  AZURE_CONTRACTS,
  getContractByBolsa,
  getContractByBillingAccountId,
  getContractByNumero,
};
