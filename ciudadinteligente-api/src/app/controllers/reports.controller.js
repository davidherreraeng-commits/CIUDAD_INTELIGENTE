const { extractRequestInfo } = require("../helpers/extract-request-info.helper");
const handleControllerError = require("../helpers/handle-controller-error.helper");
const validateRequired = require("../helpers/validate-required.helper");
const AzureBilling = require('../../infrastructure/models/projects/azure-billing.model');
const { sequelize } = require('../../infrastructure/database/billing-database.js');

const SuccessResponse = require("../../utils/success.js");

const { exportReportForDependencyService, getAvailableDatesService } = require("../services/reports.service.js");
const { getContractsCreditsSummary, getConsumptionTrend } = require("../services/azure-credits.service.js");

const { Op } = require('sequelize'); // Importante para poder filtrar rangos (between)
/**
 * GET /reports/export?dependencyId=
 * Descarga el archivo generado en backend
 */
const exportReportForDependencyController = async (req, res) => {
  try {
    const { dependencyId, month, year } = req.query;
    const { userId, path, ip } = extractRequestInfo(req);

    validateRequired({ dependencyId, month, year });

    const buffer = await exportReportForDependencyService(dependencyId, month, year, path, ip, userId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${buffer.name}.pdf`);

    return res.end(buffer.file);

  } catch (err) {
    return handleControllerError(err, res);
  }
};

/**
 * GET /reports/get-available-dates
 * Retorna lista de años y meses disponibles para generación de reportes
 */
const getAvailableDatesController = async (req, res) => {
  try {
    const { userId, path, ip } = extractRequestInfo(req);

    const data = await getAvailableDatesService(path, ip, userId);

    return new SuccessResponse(
      'Años y meses disponibles obtenidos correctamente',
      data,
      200
    ).send(res);

  } catch (err) {
    return handleControllerError(err, res);
  }
};



const getBillingSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};

    if (startDate && endDate) {
      dateFilter = {
        chargePeriodStart: {
          [Op.gte]: `${startDate}T00:00:00.000Z`, // Forzamos inicio del día en UTC estricto
          [Op.lte]: `${endDate}T23:59:59.999Z`    // Forzamos fin del día en UTC estricto
        }
      };
    }

    const summary = await AzureBilling.findAll({
      where: dateFilter,
      attributes: [
        'serviceName',
        [sequelize.fn('SUM', sequelize.col('billedCost')), 'totalCost'],
        'subAccountName',
        'resourceGroupName', // <-- AGREGAMOS ESTO
        'projectFriendlyName',
        'bolsaOrigen'
      ],
      group: [
        'serviceName',
        'subAccountName',
        'resourceGroupName',
        'projectFriendlyName',
        'bolsaOrigen'
      ],
      order: [[sequelize.fn('SUM', sequelize.col('billedCost')), 'DESC']]
    });

    const formattedData = summary.map(item => {
      const friendlyName = item.getDataValue('projectFriendlyName') || item.projectFriendlyName;
      const rawSubName = item.getDataValue('subAccountName') || item.subAccountName;
      const rawResourceGroup = item.getDataValue('resourceGroupName') || item.resourcegroupname; // <-- EXTRAEMOS ESTO

      return {
        serviceName: item.getDataValue('serviceName') || item.serviceName,
        totalCost: parseFloat(item.getDataValue('totalCost') || item.totalcost || 0),

        // Mantenemos esto para no romper tu gráfica actual
        resourceGroupName: friendlyName || rawSubName || 'Otras Dependencias',

        // Enviamos los datos reales extra para futuro uso en el frontend (ej. un tooltip o tabla detallada)
        realSubscriptionName: rawSubName,
        realResourceGroupName: rawResourceGroup || 'N/A',

        bolsaOrigen: item.getDataValue('bolsaOrigen') || item.bolsaorigen || 'Desconocida'
      };
    });

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /reports/contracts-credits?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Consumo y créditos disponibles por contrato Azure, con comparación
 * contra el periodo inmediatamente anterior de igual duración.
 */
const getContractsCreditsController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate y endDate son requeridos (formato YYYY-MM-DD)'
      });
    }

    const summary = await getContractsCreditsSummary(startDate, endDate);

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /reports/contracts-credits-trend?month=6&year=2026&months=6
 * Consumo mensual (utilized de la Balances API) de los últimos N meses
 * calendario, terminando en el mes/año pedido, por contrato y total.
 */
const getContractsCreditsTrendController = async (req, res) => {
  try {
    const { month, year, months } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: 'month y year son requeridos'
      });
    }

    const trend = await getConsumptionTrend(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10),
      months ? Number.parseInt(months, 10) : 6
    );

    // trend.error trae el motivo si faltan credenciales; el 200 se mantiene
    // porque la respuesta sigue siendo válida (meses: []), el frontend
    // decide cómo mostrarlo.
    res.status(200).json({ success: true, data: trend });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  exportReportForDependencyController,
  getAvailableDatesController,
  getBillingSummary,
  getContractsCreditsController,
  getContractsCreditsTrendController
};