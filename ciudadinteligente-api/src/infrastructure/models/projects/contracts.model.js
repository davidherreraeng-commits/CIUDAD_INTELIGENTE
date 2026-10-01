const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');

const contracts = sequelize.define('tbl_contracts', {
  idContract: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  contractNumber: { type: DataTypes.STRING(100), allowNull: false },
  idRelation: { type: DataTypes.INTEGER, allowNull: false },
  initDate: { type: DataTypes.DATEONLY, allowNull: true },
  finalDate: { type: DataTypes.DATEONLY, allowNull: true },
  budget: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'ACTIVO' },
  idContractor: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  isDelete: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, {
  timestamps: false,
  freezeTableName: true
});

module.exports = { Contracts: contracts };
