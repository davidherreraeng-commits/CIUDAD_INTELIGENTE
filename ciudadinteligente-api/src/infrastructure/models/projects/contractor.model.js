const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');

const contractor = sequelize.define('tbl_contractor', {
  idContractor: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nameContractor: { type: DataTypes.STRING(255), allowNull: false },
  isDelete: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, {
  timestamps: false,
  freezeTableName: true
});

module.exports = { Contractor: contractor };
