function extractRequestInfo (req) {
  return {
    userId: req.user?.userId,
    path: req.originalUrl,
    ip: req.ip
  };
};

module.exports = { extractRequestInfo }