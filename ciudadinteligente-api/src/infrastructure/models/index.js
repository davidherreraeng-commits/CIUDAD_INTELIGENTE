// Ya importa las relaciones previas
require('./user/index');
require('./projects/index');
require('./notification.model');

// Importar modelos que se quieren relacionar aquí
const { DependencyProjects } = require('./projects/dependencies-projects.model');
const { Progress } = require('./projects/progress.model');
const { User } = require('./user/user.model');

// Relación DependencyProjects -> UserProfile
DependencyProjects.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasMany(DependencyProjects, { foreignKey: 'userId', as: 'DependencyProjects' });

Progress.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasMany(Progress, { foreignKey: 'userId', as: 'Progress' });
