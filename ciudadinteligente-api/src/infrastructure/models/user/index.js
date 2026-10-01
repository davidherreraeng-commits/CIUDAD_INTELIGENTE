// Importar modelos (solo definición, SIN relaciones dentro de cada archivo)
const { User } = require('./user.model');
const { UserLog } = require('./user-log.model');
const { UserProfile } = require('./user-profile.model');
const { UserRole } = require('./user-role.model');

// USER ↔ USER_PROFILE (1:1)
User.hasOne(UserProfile, { foreignKey: 'userId', as: 'UserProfile' });
UserProfile.belongsTo(User, { foreignKey: 'userId', as: 'User' });

// USER ↔ USER_LOG (1:N)
User.hasMany(UserLog, { foreignKey: 'userId', as: 'UserLog' });
UserLog.belongsTo(User, { foreignKey: 'userId', as: 'User' });

// USER ↔ USER_ROLE (N:1)
User.belongsTo(UserRole, { foreignKey: 'roleId', as: 'UserRole' });
UserRole.hasMany(User, { foreignKey: 'roleId', as: 'Users' });
