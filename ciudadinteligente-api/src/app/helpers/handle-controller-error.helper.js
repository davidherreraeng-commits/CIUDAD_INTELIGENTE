const handleControllerError = (err, res) => {
  return res.status(err.statusCode || 500).json({
    message: err.message,
    details: err.details || null
  });
};

module.exports = handleControllerError;