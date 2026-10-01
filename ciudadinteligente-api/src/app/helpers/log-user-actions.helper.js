const { UserLog } = require('../../infrastructure/models/user/user-log.model');

const logUserAction = async ({ userId, ip, action, url, transaction }) => {
  if (!userId || !action || !url) {
    console.error('logUserAction: Missing required parameters');
    return;
  }

  await UserLog.create(
    {
      userId,
      ip: ip || null,
      action,
      url
    },
    transaction ? { transaction } : {}
  );
};

module.exports = { logUserAction };