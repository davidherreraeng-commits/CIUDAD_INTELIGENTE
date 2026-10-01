require('dotenv').config();
const { ContainerClient } = require('@azure/storage-blob');
const csv = require('csv-parser');
const zlib = require('zlib');
const AzureBilling = require('./azure-billing.model.js');
const AzureSubscriptionMapping = require('./subscription-mapping.model.js');
const { sequelize } = require('./database.js');

function parseBillingDate(dateValue) {
  if (!dateValue) return new Date();

  const value = String(dateValue).trim();
  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(`${year}-${month}-${day}T00:00:00-05:00`);
  }

  return new Date(value);
}

async function procesarArchivoBolsa(containerClient, carpetaPrefijo, nombreBolsa, mapeoDiccionario) {
  let archivosEncontrados = [];

  for await (const blob of containerClient.listBlobsFlat({ prefix: carpetaPrefijo })) {
    if (blob.name.endsWith('.csv') || blob.name.endsWith('.csv.gz')) archivosEncontrados.push(blob.name);
  }

  if (archivosEncontrados.length === 0) return;

  archivosEncontrados.sort();
  const archivosAProcesar = archivosEncontrados;

  for (const [fileIndex, fileName] of archivosAProcesar.entries()) {

    const blobClient = containerClient.getBlockBlobClient(fileName);
    const downloadResponse = await blobClient.download(0);

    await new Promise((resolve, reject) => {
      let stream = downloadResponse.readableStreamBody;
      if (fileName.endsWith('.gz')) {
        stream = stream.pipe(zlib.createGunzip());
      }

      let batch = [];
      const pendingInserts = [];

      stream.pipe(csv())
        .on('data', (row) => {

          // 1. Limpiamos las cabeceras de caracteres invisibles (BOM) que mete Azure
          const cleanRow = {};
          for (let key in row) {
            cleanRow[key.replace(/^\uFEFF/, '').trim()] = row[key];
          }

          // 2. Extraemos el nombre crudo de la suscripción (usando cleanRow)
          const rawSubAccountName = cleanRow['SubAccountName'] || cleanRow['x_SubAccountName'] || 'Sin Subcuenta';

          // 3. Buscamos en nuestro diccionario en memoria
          const friendlyName = mapeoDiccionario[rawSubAccountName] || rawSubAccountName;

          // 4. Extraemos el costo y cantidad reales (ahora sí encontrará BilledCost)
          const rawCost = cleanRow['BilledCost'] || cleanRow['x_BilledCostInUsd'] || 0;
          const rawQuantity = cleanRow['ConsumedQuantity'] || cleanRow['PricingQuantity'] || 0;

          batch.push({
            resourceId: cleanRow['ResourceId'] || cleanRow['x_ResourceId'],
            resourceGroupName: cleanRow['ResourceGroupName'] || cleanRow['x_ResourceGroupName'],
            serviceName: cleanRow['ServiceName'] || cleanRow['x_ServiceName'],

            // Reemplazamos coma por punto por si la configuración regional lo exporta distinto
            billedCost: parseFloat(String(rawCost).replace(',', '.')),
            consumedQuantity: parseFloat(String(rawQuantity).replace(',', '.')),

            currency: cleanRow['BillingCurrency'] || cleanRow['x_PricingCurrency'] || 'USD',
            regionName: cleanRow['RegionName'] || 'Desconocida',
            chargePeriodStart: parseBillingDate(cleanRow['ChargePeriodStart'] || cleanRow['BillingPeriodStart']),
            chargePeriodEnd: parseBillingDate(cleanRow['ChargePeriodEnd'] || cleanRow['BillingPeriodEnd']),
            sourceFilename: fileName,
            subAccountName: rawSubAccountName,
            projectFriendlyName: friendlyName,
            bolsaOrigen: nombreBolsa,
            tags: cleanRow['Tags'] ? cleanRow['Tags'] : null
          });

          if (batch.length >= 2000) {
            const currentBatch = [...batch];
            batch = [];
            pendingInserts.push(insertBatch(currentBatch));
          }
        })
        .on('end', async () => {
          try {
            if (batch.length > 0) {
              pendingInserts.push(insertBatch(batch, true));
              batch = [];
            }

            await Promise.all(pendingInserts);

            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}

async function syncHistoricalBilling() {
  try {
    const containerClient = new ContainerClient(process.env.BILLING_AZURE_STORAGE_SAS);

    console.log("[Worker] Preparando tablas y sincronizando Postgres...");
    // Sincronizamos la nueva tabla de mapeo
    await AzureSubscriptionMapping.sync({ alter: true });

    // Obtenemos los mapeos de la base de datos y los convertimos en un diccionario en memoria rápida
    const mappings = await AzureSubscriptionMapping.findAll();
    const mapeoDiccionario = {};
    mappings.forEach(m => {
      mapeoDiccionario[m.azureSubscriptionName] = m.projectFriendlyName;
    });
    console.log(`[Worker] Cargados ${mappings.length} mapeos de suscripciones al diccionario.`);

    console.log("[Worker] Preparando tabla unificada de facturación...");
    await AzureBilling.sync({ alter: true });
    await AzureBilling.destroy({ truncate: true });

    // Pasamos el diccionario a la función procesadora
    await procesarArchivoBolsa(containerClient, 'export-Subinnovaciondigital/', 'Subinnovaciondigital', mapeoDiccionario);
    await procesarArchivoBolsa(containerClient, 'export-SubInnovacionDigital_Suscripciones/', 'SubInnovacionDigital_Suscripciones', mapeoDiccionario);

  } catch (error) {
    console.error("[Worker] ❌ Error crítico:", error);
  }
}

async function insertBatch(records, isLastBatch = false) {
  try {
    await AzureBilling.bulkCreate(records, { returning: false });
    if (isLastBatch) console.log(`[Worker] Último lote insertado correctamente.`);
  } catch (error) {
    console.error(`[Worker] Error insertando lote:`, error);
    throw error;
  }
}

module.exports = { syncHistoricalBilling };