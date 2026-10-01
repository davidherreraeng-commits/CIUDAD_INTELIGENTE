const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');
const { ProjectStatus } = require('../../../enums/project-status.enum');

const contractSystems = sequelize.define('tbl_contract_systems', {
  idContractSystem: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  idContract: { type: DataTypes.INTEGER, allowNull: false },
  systemId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: ProjectStatus.EN_PROCESO
  },
  isDelete: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, {
  timestamps: false,
  freezeTableName: true
});

module.exports = { ContractSystems: contractSystems };
