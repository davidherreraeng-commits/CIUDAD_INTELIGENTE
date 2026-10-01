const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');
const { Currency } = require('../../../enums/currency.enum');

const dependency = sequelize.define('tbl_dependency', {
  dependencyId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  globalBudget: { type: DataTypes.BIGINT, allowNull: true, defaultValue: 0 },
  currency: {
    type: DataTypes.ENUM(...Object.values(Currency)),
    allowNull: false,
    defaultValue: Currency.COP
  }
}, {
  timestamps: true,
  freezeTableName: true,
  defaultScope: {
    attributes: { exclude: ['updatedAt'] }
  },
});

module.exports = { Dependency: dependency };