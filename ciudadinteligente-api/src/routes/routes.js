const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB límite (opcional)
});
const security = require("../app/middlewares/security.service");

const authController = require('../app/controllers/auth.controller');
const reportsController = require('../app/controllers/reports.controller');

router.post('/auth/login', authController.loginController);
router.post('/auth/logout', authController.logoutController);
router.post('/auth/reset-password', authController.resetPasswordController);

const userController = require('../app/controllers/user.controller');

router.get('/users/getAll', security.checkToken, userController.getAllController);
router.post('/users/create', security.checkToken, userController.createController);
router.put('/users/update', security.checkToken, userController.updateController);
router.put('/users/update-password', security.checkToken, userController.updatePasswordController);
router.delete('/users/delete', security.checkToken, userController.deleteController);

const rolesController = require('../app/controllers/roles.controller');

router.get('/roles/getAll', security.checkToken, rolesController.getAllController);

const projectsController = require('../app/controllers/projects.controller');

const cloudAuthorizationsController = require('../app/controllers/cloud-authorizations.controller');

router.get('/projects/get-dependencies', security.checkToken, projectsController.getAllDependencyController);
router.get('/projects/get-projects', security.checkToken, projectsController.getAllProjectsController);
router.get('/projects/get-projects-dependencies', security.checkToken, projectsController.getAllProjectsForDependenciesController);
router.get('/projects/get-systems-projects', security.checkToken, projectsController.getAllSystemsForProjectsController);
router.get('/projects/get-systems-summary', security.checkToken, projectsController.getSystemsSummaryController);
router.get('/projects/get-progress-system', security.checkToken, projectsController.getAllProgressForSystemsController);
router.get('/projects/contracts/catalog', security.checkToken, projectsController.getContractCatalogController);
router.get('/projects/contracts', security.checkToken, projectsController.getContractsForProjectController);
router.get('/projects/notifications/stale', security.checkToken, projectsController.getStaleProjectsNotificationController);
router.get('/reports/billing-summary', security.checkToken, reportsController.getBillingSummary);
router.get('/reports/contracts-credits', security.checkToken, reportsController.getContractsCreditsController);
router.get('/reports/contracts-credits-trend', security.checkToken, reportsController.getContractsCreditsTrendController);

router.post('/projects/projects-dependencies', security.checkToken, projectsController.postProjectsForDependenciesController);
router.post(
  '/projects/add-system-project',
  security.checkToken,
  security.requireContractManagerWhenAssociating,
  projectsController.postAddSystemForProjectController
);
router.post('/projects/create-progress', security.checkToken, upload.array('files'), projectsController.postAddProgressForSystemsController);
router.post('/projects/create-dependency', security.checkToken, projectsController.postDependencyController);
router.post('/projects/add-evidence', security.checkToken, upload.array('files'), projectsController.postAddEvidenceController);
router.post(
  '/projects/contracts',
  security.checkToken,
  security.requireContractManager,
  projectsController.postCreateContractController
);
router.post(
  '/projects/contracts/:idContract/systems',
  security.checkToken,
  security.requireContractManager,
  projectsController.postAssociateSystemToContractController
);


router.delete('/projects/projects-dependencies', security.checkToken, projectsController.deleteProjectsForDependenciesController);
router.delete('/projects/delete-system-project', security.checkToken, projectsController.deleteSystemForProjectController);
router.delete('/projects/delete-progress-system', security.checkToken, projectsController.deleteProgressForSystemController);
router.delete('/projects/delete-evidence', security.checkToken, projectsController.deleteEvidenceController);

router.put('/projects/update-progress-description', security.checkToken, projectsController.putUpdateProgressDescriptionController);
router.put('/projects/update-dates', security.checkToken, projectsController.putUpdateDatesProjectController);
router.put('/projects/update-budget-project', security.checkToken, projectsController.putUpdateBudgetProjectController);
router.put('/projects/update-systems-description', security.checkToken, projectsController.putUpdateSystemsDescriptionController);
router.put('/projects/update-systems-dates', security.checkToken, projectsController.putUpdateSystemsDatesController);
router.put('/projects/system-status', security.checkToken, projectsController.putUpdateSystemStatus);
router.put('/projects/dependencies-budget', security.checkToken, projectsController.putUpdateDependencyBudgetController);
router.put('/projects/system-alert', security.checkToken, projectsController.putToggleSystemAlertController);
router.put(
  '/projects/contracts/:idContract',
  security.checkToken,
  security.requireContractManager,
  projectsController.putUpdateContractController
);

const reportController = require('../app/controllers/reports.controller.js');

router.get('/report/get-all', security.checkToken, reportController.exportReportForDependencyController);
router.get('/report/get-available-dates', security.checkToken, reportController.getAvailableDatesController);

// --- RUTAS AUTORIZACIONES CLOUD ---
router.get('/cloud-authorizations/get-all', 
  security.checkToken, 
  cloudAuthorizationsController.getAllAuthorizationsController
);

router.post('/cloud-authorizations/create', 
  security.checkToken, 
  upload.array('files'), // Middleware para procesar los PDFs
  cloudAuthorizationsController.createAuthorizationController
);

router.delete('/cloud-authorizations/delete-attachment',
  security.checkToken,
  cloudAuthorizationsController.deleteAuthorizationAttachmentController
);

router.put('/cloud-authorizations/observations',
  security.checkToken,
  cloudAuthorizationsController.updateAuthorizationObservationsController
);

// Ruta crítica: El usuario con rol Subsecretaría firma aquí
router.put('/cloud-authorizations/approve', 
  security.checkToken, 
  cloudAuthorizationsController.approveAuthorizationController
);

const inventoryController = require('../app/controllers/inventory.controller');
// --- INVENTARIO PÚBLICO (sin autenticación) ---
router.get('/inventory/public', inventoryController.getInventoryController);

// --- INVENTARIO DE DATOS (autenticado) ---

router.get('/inventory/get-all', security.checkToken, inventoryController.getInventoryController);

module.exports = router;
// Removido el module.exports anterior — se agrega al final del archivo
