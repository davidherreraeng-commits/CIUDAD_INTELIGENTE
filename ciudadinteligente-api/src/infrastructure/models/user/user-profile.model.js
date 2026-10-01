const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');

const userProfile = sequelize.define('tbl_user_profile', {
  idProfile: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(255), allowNull: true, validate: { isEmail: true } },
  emailDelete: { type: DataTypes.STRING(255), allowNull: true, validate: { isEmail: true } },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  name: { type: DataTypes.TEXT, allowNull: false, },
  lastName: { type: DataTypes.TEXT, allowNull: false, },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'tbl_user',
      key: 'userId',
    },
  },
}, {
  timestamps: true,
  freezeTableName: true,
  defaultScope: {
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  },
});

module.exports = { UserProfile: userProfile };