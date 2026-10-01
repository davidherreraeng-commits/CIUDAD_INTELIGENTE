const ErrorResponse = require('../../utils/error');

const validateModelRequired = (model) => {
  if (!model || (typeof model === 'object' && Object.keys(model).length === 0)) {
    throw new ErrorResponse('No se encontraron registros...', 404);
  }
};

module.exports = validateModelRequired;