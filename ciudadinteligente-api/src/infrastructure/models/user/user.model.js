const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');

const user = sequelize.define('tbl_user', {
  userId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.TEXT, allowNull: false, },
  token: { type: DataTypes.TEXT, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tbl_user_role',
      key: 'roleId',
    },
  }
}, {
  timestamps: true,
  freezeTableName: true,
  defaultScope: {
    attributes: { exclude: ['password', 'token', 'createdAt', 'updatedAt'] }
  },
});

module.exports = { User: user };