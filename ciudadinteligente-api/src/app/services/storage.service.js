const { BlobServiceClient, ContainerClient } = require("@azure/storage-blob");
const path = require('path');

const getContainerClient = async () => {
  const storageUrl = process.env.AZURE_STORAGE_URL;
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_STORAGE_CONTAINER;

  if (storageUrl) {
    return new ContainerClient(storageUrl);
  }

  if (connectionString && containerName) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists({ access: 'blob' });
    return containerClient;
  }

  throw new Error("Configuración de almacenamiento no encontrada");
};

// Función auxiliar para subir el archivo
const uploadFileToAzure = async (file) => {
  try {
    // 2. Validar que el archivo venga bien desde Multer
    if (!file || !file.buffer) {
      throw new Error("Archivo inválido recibido en el servicio");
    }

    // 3. Conexión (Igual que en tu test)
    const containerClient = await getContainerClient();

    // 4. Generar nombre único
    const timestamp = Date.now();
    const originalName = file.originalname; 
    const extension = path.extname(originalName);
    const blobName = `${timestamp}-${path.basename(originalName, extension)}${extension}`;

    // 5. Preparar cliente del blob
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // 6. SUBIR (Usamos uploadData para buffers)
    
    
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { 
        blobContentType: file.mimetype 
      }
    });


    return {
      url: blockBlobClient.url,
      blobName: blobName,
      fileName: originalName,
      mimetype: file.mimetype
    };

  } catch (error) {
    // Relanzamos el error para que Projects Service haga el Rollback
    throw error; 
  }
};

const deleteFileFromAzure = async (blobName) => {
  try {
    const containerClient = await getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.deleteIfExists();
    return true;
  } catch (error) {
    console.error("Error eliminando archivo de Azure:", error.message);
    throw error;
  }
};

module.exports = { uploadFileToAzure, deleteFileFromAzure};
