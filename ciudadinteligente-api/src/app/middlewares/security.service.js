const jwt = require('jsonwebtoken')
const config = require('../../../config/config')
const { User } = require('../../infrastructure/models/user/user.model');
const { UserRole } = require('../../infrastructure/models/user/user-role.model');

const normalizeRoleName = (name) => String(name || '').trim().toLocaleLowerCase();

const checkToken = (req, res, next) => {
  let token = null;
  if (req.headers && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }
  if (token) {
    jwt.verify(token, config.JWTSecret, function (err, decode) {
      if (err) return res.status(401).json({ ...err, message: 'Sin autorización' })
      User.findOne({
        where: { token, userId: decode.userId, isActive: true },
        raw: true,
        logging: false,
      })
        .then((user) => {
          if (!user) return res.status(401).json({ message: 'Sin autorización', err: 'user not found' })
          req['user'] = {
            userId: user.userId,
            roleId: user.roleId,
          }
          next()
        })
        .catch((err) => res.status(500).json({ err }))
    })
  } else {
    res.status(401).json({ message: 'Sin autorización' })
  }
}

const requireRole = (...allowedRoles) => async (req, res, next) => {
  try {
    if (!req.user?.roleId) {
      return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
    }

    const role = await UserRole.findOne({
      where: { roleId: req.user.roleId },
      attributes: ['name'],
      raw: true,
      logging: false
    });
    const allowedRoleNames = allowedRoles.map(normalizeRoleName);

    if (!role || !allowedRoleNames.includes(normalizeRoleName(role.name))) {
      return res.status(403).json({
        message: 'Esta acción está reservada para el rol system_manager'
      });
    }

    req.user.roleName = role.name;
    return next();
  } catch (err) {
    return res.status(500).json({ message: 'No se pudo validar el permiso del usuario' });
  }
};

const requireContractManager = requireRole('system_manager');

const requireContractManagerWhenAssociating = (req, res, next) => {
  if (!req.body?.idContract) return next();
  return requireContractManager(req, res, next);
};

module.exports = {
  checkToken,
  requireContractManager,
  requireContractManagerWhenAssociating
}
