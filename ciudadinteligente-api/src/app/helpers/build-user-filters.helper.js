const { Op } = require('sequelize');

function buildUserFilters (decodedFilters) {
  const baseUserWhere = {
    isActive: true,
    ...(decodedFilters.username && { username: decodedFilters.username })
  };

  const profileWhere = {
    ...(decodedFilters.email && { email: { [Op.iLike]: `%${decodedFilters.email}%` } }),
    ...(decodedFilters.name && { name: { [Op.iLike]: `%${decodedFilters.name}%` } }),
    ...(decodedFilters.lastName && { lastName: { [Op.iLike]: `%${decodedFilters.lastName}%` } })
  };

  const roleWhere = {
    ...(decodedFilters.roleId && { roleId: decodedFilters.roleId })
  };

  return {
    baseUserWhere,
    profileWhere,
    roleWhere
  };
}

module.exports = { buildUserFilters };