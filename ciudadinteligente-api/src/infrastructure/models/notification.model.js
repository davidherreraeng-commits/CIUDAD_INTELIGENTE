const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/database');

const notification = sequelize.define('tbl_notification', {
  notificationId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  to: { type: DataTypes.TEXT, allowNull: true },
  subject: { type: DataTypes.TEXT, allowNull: true },
  type: { type: DataTypes.STRING, allowNull: true },
  errorMessage: { type: DataTypes.TEXT, allowNull: true },
  statusCode: { type: DataTypes.INTEGER, allowNull: true },
  response: { type: DataTypes.TEXT, allowNull: true },
}, {
  timestamps: true,
  freezeTableName: true,
  defaultScope: {
    attributes: { exclude: ['updatedAt'] }
  },
});

module.exports = { Notification: notification };