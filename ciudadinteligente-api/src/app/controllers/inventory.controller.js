const SuccessResponse = require('../../utils/success');
const handleControllerError = require('../helpers/handle-controller-error.helper');
const { getInventoryService } = require('../services/inventory.service');

const getInventoryController = async (req, res) => {
  try {
    const data = await getInventoryService();
    return new SuccessResponse('Inventario obtenido exitosamente', data, 200).send(res);
  } catch (err) {
    return handleControllerError(err, res);
  }
};

module.exports = { getInventoryController };
