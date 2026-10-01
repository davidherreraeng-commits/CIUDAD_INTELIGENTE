const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');

const userRole = sequelize.define('tbl_user_role', {
  roleId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false }
}, {
  timestamps: true,
  freezeTableName: true,
  defaultScope: {
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  },
});

module.exports = { UserRole: userRole };