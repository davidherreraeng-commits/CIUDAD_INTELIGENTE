const { UserLogActions } = require('../../enums/user-log-actions.enum');
const { sequelize } = require('../../infrastructure/database/database');

const { UserRole } = require('../../infrastructure/models/user/user-role.model');

const { logUserAction } = require('../helpers/log-user-actions.helper');

const getAllService = async (path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const roles = UserRole.findAll();

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.GET_ALL_ROLES,
      url: path,
      transaction: t
    });

    return roles;
  });
};

module.exports = {
  getAllService
}
