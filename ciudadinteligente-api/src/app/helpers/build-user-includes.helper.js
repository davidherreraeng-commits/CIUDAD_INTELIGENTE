const { UserProfile } = require("../../infrastructure/models/user/user-profile.model");
const { UserRole } = require("../../infrastructure/models/user/user-role.model");

function buildUserIncludes (profileWhere, roleWhere) {
  return [
    {
      model: UserProfile,
      as: 'UserProfile',
      where: profileWhere,
      attributes: { exclude: ['userId'] }
    },
    {
      model: UserRole,
      as: 'UserRole',
      where: roleWhere
    }
  ];
}

module.exports = { buildUserIncludes };