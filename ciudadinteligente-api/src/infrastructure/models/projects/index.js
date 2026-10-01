const { Dependency } = require('./dependencies.model');
const { DependencyProjects } = require('./dependencies-projects.model');
const { Projects } = require('./projects.model');
const { Systems } = require('./systems.model');
const { Progress } = require('./progress.model');
const { User } = require('../user/user.model');

const { CloudAuthorization } = require('./cloud-authorizations.model');
const { CloudServices } = require('./cloud-services.model');
const { CloudAttachments } = require('./cloud-attachments.model');

const { ProgressEvidence } = require('./progress-evidence.model');
const { Contractor } = require('./contractor.model');
const { Contracts } = require('./contracts.model');
const { ContractSystems } = require('./contract-systems.model');

Dependency.belongsToMany(Projects, {
  through: DependencyProjects,
  foreignKey: 'dependencyId',
  otherKey: 'projectsId',
  as: 'Projects'
});
Projects.belongsToMany(Dependency, {
  through: DependencyProjects,
  foreignKey: 'projectsId',
  otherKey: 'dependencyId',
  as: 'Dependency'
});

DependencyProjects.belongsTo(Projects, {
  foreignKey: 'projectsId',
  as: 'Project'
});
DependencyProjects.belongsTo(Dependency, {
  foreignKey: 'dependencyId',
  as: 'Dependency'
});

Progress.belongsTo(Systems, { foreignKey: 'systemsId', as: 'Systems' });
Systems.hasMany(Progress, { foreignKey: 'systemsId', as: 'Progress' });

Systems.belongsTo(DependencyProjects, { foreignKey: 'idRelation', as: 'DependencyProjects' });
DependencyProjects.hasMany(Systems, { foreignKey: 'idRelation', as: 'Systems' });

Progress.hasMany(ProgressEvidence, { foreignKey: 'progressId', as: 'Evidence' });
ProgressEvidence.belongsTo(Progress, { foreignKey: 'progressId', as: 'Progress' });

Contractor.hasMany(Contracts, { foreignKey: 'idContractor', as: 'Contracts' });
Contracts.belongsTo(Contractor, { foreignKey: 'idContractor', as: 'Contractor' });

User.hasMany(Contracts, { foreignKey: 'userId', as: 'Contracts' });
Contracts.belongsTo(User, { foreignKey: 'userId', as: 'User' });

DependencyProjects.hasMany(Contracts, { foreignKey: 'idRelation', as: 'Contracts' });
Contracts.belongsTo(DependencyProjects, { foreignKey: 'idRelation', as: 'DependencyProject' });

Contracts.hasMany(ContractSystems, { foreignKey: 'idContract', as: 'ContractSystems' });
ContractSystems.belongsTo(Contracts, { foreignKey: 'idContract', as: 'Contract' });

Systems.hasMany(ContractSystems, { foreignKey: 'systemId', as: 'ContractSystems' });
ContractSystems.belongsTo(Systems, { foreignKey: 'systemId', as: 'System' });

ContractSystems.hasMany(Progress, { foreignKey: 'idContractSystem', as: 'Progress' });
Progress.belongsTo(ContractSystems, { foreignKey: 'idContractSystem', as: 'ContractSystem' });


CloudAuthorization.hasMany(CloudServices, { foreignKey: 'authId', as: 'Services' });
CloudServices.belongsTo(CloudAuthorization, { foreignKey: 'authId', as: 'Authorization' });

CloudAuthorization.hasMany(CloudAttachments, { foreignKey: 'authId', as: 'Attachments' });
CloudAttachments.belongsTo(CloudAuthorization, { foreignKey: 'authId', as: 'Authorization' });

CloudAuthorization.belongsTo(User, { foreignKey: 'approvedBy', as: 'Approver' });

module.exports = {
    Dependency,
    DependencyProjects,
    Projects,
    Systems,
    Progress,
    ProgressEvidence,
    Contractor,
    Contracts,
    ContractSystems
};
