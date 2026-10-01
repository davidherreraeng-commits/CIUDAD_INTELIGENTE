const SuccessResponse = require("../../utils/success");
const { extractRequestInfo } = require("../helpers/extract-request-info.helper");
const handleControllerError = require("../helpers/handle-controller-error.helper");
const validateRequired = require("../helpers/validate-required.helper");

const {
  getAllAuthorizationsService,
  createOrUpdateAuthorizationService,
  deleteAuthorizationAttachmentService,
  updateAuthorizationObservationsService,
  approveAuthorizationService
} = require("../services/cloud-authorizations.service");

const getAllAuthorizationsController = async (req, res) => {
  try {
    const { userId, path, ip } = extractRequestInfo(req);
    const result = await getAllAuthorizationsService(path, ip, userId);
    return new SuccessResponse('Autorizaciones obtenidas con éxito', result, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const createAuthorizationController = async (req, res) => {
  try {
    // 1. Recibimos los campos
    const { authId, systemName, description, observations, secretaria, services } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);
    const files = req.files || [];
    
    // 2. Validamos que vengan los datos correctos
    validateRequired({ systemName, description, secretaria });
    
    // 3. Parseamos los servicios
    const parsedServices = services ? JSON.parse(services) : [];

    // 4. Armamos el bodyData con el authId incluido
    const bodyData = { 
      authId: authId ? parseInt(authId) : null, // Lo pasamos como número si existe
      systemName, 
      description, 
      observations, //Se agrega nuevo campo
      secretaria, 
      services: parsedServices 
    };

    // 5. Llamamos al servicio
    const result = await createOrUpdateAuthorizationService(bodyData, files, path, ip, userId);
    
    return new SuccessResponse('Solicitud guardada correctamente', result, 201).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const approveAuthorizationController = async (req, res) => {
  try {
    const { authId } = req.body;
    const { userId, path, ip } = extractRequestInfo(req); // ¡Aquí tomamos el ID del token!
    
    validateRequired({ authId });

    const result = await approveAuthorizationService(authId, path, ip, userId);
    return new SuccessResponse('Sistema aprobado y firmado exitosamente', result, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const deleteAuthorizationAttachmentController = async (req, res) => {
  try {
    const { attachmentId } = req.body;

    validateRequired({ attachmentId });

    const result = await deleteAuthorizationAttachmentService(attachmentId);
    return new SuccessResponse('Archivo adjunto eliminado correctamente', result, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const updateAuthorizationObservationsController = async (req, res) => {
  try {
    const { authId, observations } = req.body;

    validateRequired({ authId });

    const result = await updateAuthorizationObservationsService(authId, observations);
    return new SuccessResponse('Observaciones actualizadas correctamente', result, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

module.exports = {
  getAllAuthorizationsController,
  createAuthorizationController,
  deleteAuthorizationAttachmentController,
  updateAuthorizationObservationsController,
  approveAuthorizationController
};
