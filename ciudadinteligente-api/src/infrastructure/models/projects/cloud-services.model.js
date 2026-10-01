const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');

const cloudServices = sequelize.define('tbl_cloud_services', {
  serviceId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  authId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'tbl_cloud_authorizations', key: 'authId' }
  },
  serviceName: { type: DataTypes.STRING(255), allowNull: false }, 
  monthlyCost: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  isDelete: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: true,
  freezeTableName: true,
});

module.exports = { CloudServices: cloudServices };