const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');
const { ProjectStatus } = require('../../../enums/project-status.enum');

const systems = sequelize.define('tbl_systems', {
  systemsId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  initDate: { type: DataTypes.DATE, allowNull: true },
  finalDate: { type: DataTypes.DATE, allowNull: true },
  isDelete: { type: DataTypes.BOOLEAN, defaultValue: false },
  hasAlert: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM(...Object.values(ProjectStatus)), // Añadido spread operator para asegurar compatibilidad de arrays
    defaultValue: ProjectStatus.EN_PROCESO,
    allowNull: false
  },
  idRelation: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tbl_dependency_projects',
      key: 'idRelation'
    }
  }
}, {
  timestamps: true,
  freezeTableName: true,
  defaultScope: {
    attributes: { exclude: ['updatedAt'] }
  },
});

module.exports = { Systems: systems };