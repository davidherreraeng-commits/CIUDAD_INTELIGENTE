/**
 * Precarga tbl_azure_balances con el balance de todos los meses (desde la
 * fecha de inicio de cada contrato hasta el mes vigente), para que el
 * reporte "Créditos por Contrato" no dependa de que alguien abra la página
 * primero para "calentar" el caché mes por mes.
 *
 * Uso (desde la raíz de ciudadinteligente-api, con el .env configurado):
 *   node scripts/backfill-azure-balances.js
 *
 * Es seguro correrlo varias veces: los meses cerrados que ya estén en BD se
 * detectan como cacheados y no vuelven a pedirse a Azure (ver
 * getCachedBalance en azure-balances.service.js); solo se completan los que
 * falten o se refresca el mes vigente si su caché ya venció.
 */
require('dotenv').config();

const azureBalances = require('../src/app/services/azure-balances.service');
const { AZURE_CONTRACTS } = require('../src/config/azure-contracts.config');

function monthsFrom(fechaInicio) {
  const start = new Date(`${fechaInicio}T00:00:00-05:00`);
  const now = new Date();
  const periods = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth(), 1);

  while (cursor <= last) {
    periods.push(`${cursor.getFullYear()}${String(cursor.getMonth() + 1).padStart(2, '0')}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return periods;
}

async function main() {
  if (!azureBalances.isConfigured()) {
    console.error('Faltan AZURE_TENANT_ID/AZURE_CLIENT_ID/AZURE_CLIENT_SECRET en el .env — no se puede consultar la Balances API.');
    process.exit(1);
  }

  for (const contract of AZURE_CONTRACTS) {
    const periods = monthsFrom(contract.fechaInicio);
    console.log(`\nContrato ${contract.numeroContrato} (${contract.billingAccountId}) — ${periods.length} meses`);

    // Secuencial a propósito: es un script de una sola vez, no vale la pena
    // arriesgar un rate-limit de la Balances API por paralelizar.
    for (const periodName of periods) {
      try {
        await azureBalances.getCachedBalance(contract.billingAccountId, periodName);
        console.log(`  ${periodName} OK`);
      } catch (err) {
        console.error(`  ${periodName} ERROR: ${err.message}`);
      }
    }
  }

  console.log('\nListo.');
  process.exit(0);
}

main();
