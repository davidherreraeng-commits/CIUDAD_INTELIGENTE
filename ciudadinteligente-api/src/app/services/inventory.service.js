const { ContainerClient } = require('@azure/storage-blob');
const csv = require('csv-parser');

const BLOB_NAME = 'Inventario de datos Alcalde.csv';

async function getInventoryService() {
  const sasUrl = process.env.ARG_VISOR_DATOS_AZURE_STORAGE_URL;
  if (!sasUrl) throw new Error('ARG_VISOR_DATOS_AZURE_STORAGE_URL no está configurada');

  const containerClient = new ContainerClient(sasUrl);
  const blobClient = containerClient.getBlockBlobClient(BLOB_NAME);

  const downloadResponse = await blobClient.download(0);
  const stream = downloadResponse.readableStreamBody;

  return new Promise((resolve, reject) => {
    const rows = [];
    stream
      .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

module.exports = { getInventoryService };
