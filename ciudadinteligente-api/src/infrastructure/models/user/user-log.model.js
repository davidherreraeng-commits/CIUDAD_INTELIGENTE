const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');
const { UserLogActions } = require('../../../enums/user-log-actions.enum');

const userLog = sequelize.define('tbl_user_log', {
  logId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ip: { type: DataTypes.TEXT, allowNull: true, validate: { isIP: true } },
  action: { 
    type: DataTypes.ENUM(...Object.values(UserLogActions)),
    allowNull: false 
  },
  url: { type: DataTypes.TEXT, allowNull: false },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tbl_user',
      key: 'userId',
    },
  },
}, {
  timestamps: true,
  freezeTableName: true,
  defaultScope: {
    attributes: { exclude: ['ip', 'updatedAt'] }
  },
});

module.exports = { UserLog: userLog };