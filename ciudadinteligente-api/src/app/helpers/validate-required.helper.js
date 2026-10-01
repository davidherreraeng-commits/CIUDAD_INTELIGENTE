const ErrorResponse = require('../../utils/error');

const validateRequired = (fields) => {
  for (const [_, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === '') {
      throw new ErrorResponse(`Los datos enviados no son válidos...`, 400);
    }
  }
};

module.exports = validateRequired;