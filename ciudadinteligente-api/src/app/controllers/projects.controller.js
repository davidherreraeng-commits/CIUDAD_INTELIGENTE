const SuccessResponse = require("../../utils/success");

const { extractRequestInfo } = require("../helpers/extract-request-info.helper");
const handleControllerError = require("../helpers/handle-controller-error.helper");
const validateRequired = require("../helpers/validate-required.helper");

const {
  getAllDependencyService,
  getAllProjectsService,
  getAllDependenciesForProjectsService,
  postProjectsForDependenciesService,
  deleteProjectsForDependenciesService,
  getAllSystemsForProjectsService,
  getSystemsSummaryService,
  updateProjectBudgetService,
  updateProjectDatesService,
  addSystemForProjectService,
  deleteSystemForProjectService,
  updateSystemsDescriptionService,
  updateSystemsDatesService,
  getAllProgressForSystemsService,
  postAddProgressForSystemsService,
  updateProgressDescriptionService,
  deleteProgressForSystemsService,
  updateSystemStatusService,
  getStaleProjectsNotificationService,
  createDependencyService,
  updateDependencyBudgetService,
  addProgressEvidenceService,
  deleteProgressEvidenceService,
  toggleSystemAlertService,
  createContractService,
  getContractsForProjectService,
  getContractCatalogService,
  updateContractService,
  associateSystemToContractService
} = require("../services/projects.service");

const getContractsForProjectController = async (req, res) => {
  try {
    const { idRelation } = req.query;
    validateRequired({ idRelation });

    const result = await getContractsForProjectService(idRelation);
    return new SuccessResponse('Contratos obtenidos correctamente', result, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const getContractCatalogController = async (req, res) => {
  try {
    const { idRelation } = req.query;
    const result = await getContractCatalogService(idRelation ? Number(idRelation) : null);
    return new SuccessResponse('Catálogo de contratos obtenido correctamente', result, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const postCreateContractController = async (req, res) => {
  try {
    const {
      idRelation,
      contractNumber,
      contractor,
      initDate,
      finalDate,
      budget,
      status,
      systems
    } = req.body;
    const { userId } = extractRequestInfo(req);

    validateRequired({ idRelation, contractNumber, contractor, initDate, finalDate, budget, status });

    const result = await createContractService({
      idRelation,
      contractNumber,
      contractor,
      initDate,
      finalDate,
      budget,
      status,
      systems
    }, userId);

    return new SuccessResponse('Contrato creado correctamente', result, 201).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const putUpdateContractController = async (req, res) => {
  try {
    const { idContract } = req.params;
    const { contractNumber, contractor, initDate, finalDate, budget, status } = req.body;

    validateRequired({
      idContract,
      contractNumber,
      contractor,
      initDate,
      finalDate,
      budget,
      status
    });

    const result = await updateContractService({
      idContract: Number(idContract),
      contractNumber,
      contractor,
      initDate,
      finalDate,
      budget,
      status
    });

    return new SuccessResponse('Contrato actualizado correctamente', result, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const postAssociateSystemToContractController = async (req, res) => {
  try {
    const { idContract } = req.params;
    const { systemsId, includeHistory = false } = req.body;

    validateRequired({ idContract, systemsId });

    const result = await associateSystemToContractService({
      idContract: Number(idContract),
      systemsId: Number(systemsId),
      includeHistory: includeHistory === true
    });

    return new SuccessResponse('Sistema asociado al contrato correctamente', result, 201).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const getAllDependencyController = async (req, res) => {
  try {
    const { ...filters } = req.query;
    const { userId, path, ip } = extractRequestInfo(req);

    const dependency = await getAllDependencyService(filters, path, ip, userId);

    return new SuccessResponse('Obtención de dependencias exitosa', dependency, 200).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
}

const getAllProjectsController = async (req, res) => {
  try {
    const { userId, path, ip } = extractRequestInfo(req);

    const projects = await getAllProjectsService(path, ip, userId);

    return new SuccessResponse('Obtención de proyectos exitosa', projects, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const getAllProjectsForDependenciesController = async (req, res) => {
  try {
    const { dependencyId, systemName, status } = req.query;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ dependencyId })

    const dependencies = await getAllDependenciesForProjectsService(dependencyId, systemName, status, path, ip, userId);

    return new SuccessResponse('Obtención de proyectos de la dependencia exitosa', dependencies, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const postProjectsForDependenciesController = async (req, res) => {
  try {
    const { dependencyId, projectsId } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ dependencyId, projectsId })

    const dependencies = await postProjectsForDependenciesService(dependencyId, projectsId, path, ip, userId);

    return new SuccessResponse('Obtención de proyectos de la dependencia exitosa', dependencies, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
}

const deleteProjectsForDependenciesController = async (req, res) => {
  try {
    const { dependencyId, projectsId } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ dependencyId, projectsId });

    const result = await deleteProjectsForDependenciesService(dependencyId, projectsId, path, ip, userId);

    return new SuccessResponse('Eliminación de proyecto para dependencia exitosa', result, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const putUpdateBudgetProjectController = async (req, res) => {
  try {
    const { idRelation, value } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ idRelation, value });

    const result = await updateProjectBudgetService(idRelation, value, path, ip, userId);

    return new SuccessResponse('Actualización del presupuesto del proyecto exitosa', result, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const putUpdateDatesProjectController = async (req, res) => {
  try {
    const { idRelation, initDate, finalDate } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ idRelation, initDate, finalDate });

    const result = await updateProjectDatesService(idRelation, initDate, finalDate, path, ip, userId);

    return new SuccessResponse('Actualización de fechas del proyecto exitosa', result, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const getAllSystemsForProjectsController = async (req, res) => {
  try {
    const { idRelation, systemName, status } = req.query;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ idRelation });

    const systems = await getAllSystemsForProjectsService(idRelation, systemName, status, path, ip, userId);

    return new SuccessResponse(
      'Obtención de sistemas del proyecto exitosa',
      systems,
      200
    ).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
};

const getSystemsSummaryController = async (req, res) => {
  try {
    const { ...filters } = req.query;
    const { userId, path, ip } = extractRequestInfo(req);

    const systems = await getSystemsSummaryService(filters, path, ip, userId);

    return new SuccessResponse('Obtención del resumen de sistemas exitosa', systems, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const putUpdateSystemsDatesController = async (req, res) => {
  try {
    const { systemsId, initDate, finalDate } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ systemsId, initDate, finalDate });

    const result = await updateSystemsDatesService(
      systemsId,
      initDate,
      finalDate,
      path,
      ip,
      userId
    );

    return new SuccessResponse(
      'Actualización de fechas del sistema exitosa',
      result,
      200
    ).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const putUpdateSystemStatus = async (req, res) => {
  try {
    const { systemsId, status, idContractSystem } = req.body;

    const { ip, path, userId } = extractRequestInfo(req);

    validateRequired({ systemsId, status });

    const result = await updateSystemStatusService(
      systemsId,
      status,
      idContractSystem,
      path,
      ip,
      userId
    );

    return new SuccessResponse(
      'Estado actualizado correctamente',
      result,
      200
    ).send(res);
  } catch (error) {
    return handleControllerError(error, res)
  }
}

const postAddSystemForProjectController = async (req, res) => {
  try {
    const { idRelation, idContract, name, description, initDate, finalDate } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ idRelation, name, initDate, finalDate });

    const result = await addSystemForProjectService(
      idRelation,
      name,
      description,
      initDate,
      finalDate,
      idContract,
      path,
      ip,
      userId
    );

    return new SuccessResponse(
      'Sistema creado correctamente para el proyecto',
      result,
      201
    ).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
};

const deleteSystemForProjectController = async (req, res) => {
  try {
    const { systemsId } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ systemsId });

    const result = await deleteSystemForProjectService(
      systemsId,
      path,
      ip,
      userId
    );

    return new SuccessResponse(
      'Eliminación de sistema del proyecto exitosa',
      result,
      200
    ).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
};

const putUpdateSystemsDescriptionController = async (req, res) => {
  try {
    const { systemsId, description } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ systemsId, description });

    const result = await updateSystemsDescriptionService(
      systemsId,
      description,
      path,
      ip,
      userId
    );

    return new SuccessResponse(
      'Actualización de descripción del sistema exitosa',
      result,
      200
    ).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
};

const getAllProgressForSystemsController = async (req, res) => {
  try {
    const { systemsId, idContractSystem } = req.query;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ systemsId });

    const result = await getAllProgressForSystemsService(systemsId, idContractSystem, path, ip, userId);

    return new SuccessResponse(
      'Obtención de avances del sistema exitosa',
      result,
      200
    ).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
};


const postAddProgressForSystemsController = async (req, res) => {
  try {
    const { systemsId, idContractSystem, year, month, name, description, hasPending } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);
    const files = req.files || [];

    validateRequired({ systemsId, year, month, name });

    const result = await postAddProgressForSystemsService(
      systemsId,
      idContractSystem,
      year,
      month,
      name,
      description,
      hasPending,
      files,
      path,
      ip,
      userId
    );

    return new SuccessResponse('Avance registrado correctamente', result, 201).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const putUpdateProgressDescriptionController = async (req, res) => {
  try {
    const { progressId, description, hasPending } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ progressId, description });

    const result = await updateProgressDescriptionService(
      progressId,
      description,
      hasPending,
      path,
      ip,
      userId
    );

    return new SuccessResponse(
      'Actualización de descripción del avance exitosa',
      result,
      200
    ).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
};

const deleteProgressForSystemController = async (req, res) => {
  try {
    const { progressId } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ progressId });

    const result = await deleteProgressForSystemsService(
      progressId,
      path,
      ip,
      userId
    );

    return new SuccessResponse(
      'Eliminación de avance del sistema exitosa',
      result,
      200
    ).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
};

const getStaleProjectsNotificationController = async (req, res) => {
  try {

    // Opción A: Si tu helper ya lo devuelve (lo más probable):
    const { userId, roleId } = extractRequestInfo(req);

    // 2. Pasamos el roleId al servicio
    const data = await getStaleProjectsNotificationService(userId, roleId);

    return new SuccessResponse(
      'Notificaciones de inactividad obtenidas correctamente',
      data,
      200
    ).send(res);
  } catch (error) { // Recuerda que cambiamos 'err' por 'error'
    return handleControllerError(error, res);
  }
}

const postDependencyController = async (req, res) => {
  try {
    const { name } = req.body;

    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ name });

    const result = await createDependencyService(name, path, ip, userId);

    return new SuccessResponse(
      'Dependencia creada correctamente: ',
      result,
      201,
    ).send(res);
  } catch (error) {
    return handleControllerError(error, res)
  }
}

const putUpdateDependencyBudgetController = async (req, res) => {
  try {
    const { dependencyId, globalBudget, currency } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ dependencyId, globalBudget, currency });

    // Llamamos al servicio
    const result = await updateDependencyBudgetService(dependencyId, globalBudget, currency, path, ip, userId);

    return new SuccessResponse('Presupuesto de la secretaría actualizado', result, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const postAddEvidenceController = async (req, res) => {
  try {
    const { progressId } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);
    const files = req.files || [];

    validateRequired({ progressId });

    const result = await addProgressEvidenceService(progressId, files, path, ip, userId);
    return new SuccessResponse('Evidencias agregadas correctamente', result, 201).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const deleteEvidenceController = async (req, res) => {
  try {
    const { evidenceId } = req.body;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ evidenceId });

    const result = await deleteProgressEvidenceService(evidenceId, path, ip, userId);
    return new SuccessResponse('Evidencia eliminada correctamente', result, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

const putToggleSystemAlertController = async (req, res) => {
  try {
    const { systemsId, hasAlert } = req.body;
    const { ip, path, userId } = extractRequestInfo(req);

    validateRequired({ systemsId, hasAlert: hasAlert !== undefined ? hasAlert : null });

    const result = await toggleSystemAlertService(systemsId, hasAlert, path, ip, userId);

    return new SuccessResponse('Alerta del sistema actualizada', result, 200).send(res);
  } catch (error) {
    return handleControllerError(error, res);
  }
};

module.exports = {
  getAllDependencyController,
  getAllProjectsController,
  putUpdateBudgetProjectController,
  putUpdateDatesProjectController,
  getAllProjectsForDependenciesController,
  postProjectsForDependenciesController,
  deleteProjectsForDependenciesController,
  getAllSystemsForProjectsController,
  getSystemsSummaryController,
  postAddSystemForProjectController,
  deleteSystemForProjectController,
  putUpdateSystemsDescriptionController,
  putUpdateSystemsDatesController,
  getAllProgressForSystemsController,
  postAddProgressForSystemsController,
  putUpdateProgressDescriptionController,
  deleteProgressForSystemController,
  putUpdateSystemStatus,
  getStaleProjectsNotificationController,
  postDependencyController,
  putUpdateDependencyBudgetController,
  postAddEvidenceController,
  deleteEvidenceController,
  putToggleSystemAlertController,
  postCreateContractController,
  getContractsForProjectController,
  getContractCatalogController,
  putUpdateContractController,
  postAssociateSystemToContractController
}
