const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');

const dependencyProjects = sequelize.define('tbl_dependency_projects', {
  idRelation: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  dependencyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tbl_dependency',
      key: 'dependencyId'
    }
  },

  projectsId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tbl_projects',
      key: 'projectsId'
    }
  },

  initDate: { type: DataTypes.DATE, allowNull: true },
  finalDate: { type: DataTypes.DATE, allowNull: true},
  isDelete: { type: DataTypes.BOOLEAN, defaultValue: false },
  budget: { type: DataTypes.BIGINT, allowNull: true }
  
}, {
  timestamps: true,
  freezeTableName: true,
  defaultScope: {
    attributes: { exclude: ['createdAt', 'isDelete'] }
  },
});

module.exports = { DependencyProjects: dependencyProjects };