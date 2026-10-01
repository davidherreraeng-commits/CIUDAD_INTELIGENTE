const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');

const cloudAuthorization = sequelize.define('tbl_cloud_authorizations', {
  authId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  systemName: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  observations: { type: DataTypes.STRING(250), allowNull: true },
  secretaria: { type: DataTypes.STRING(255), allowNull: false },
  clave: { type: DataTypes.STRING(50), allowNull: true },
  
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
  isApproved2: { type: DataTypes.BOOLEAN, defaultValue: false },
  isApproved3: { type: DataTypes.BOOLEAN, defaultValue: false },
  approvalDate: { type: DataTypes.DATE, allowNull: true },
  approvedBy: { 
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'tbl_user', key: 'userId' }
  },
  isDelete: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: true,
  freezeTableName: true,
  defaultScope: { attributes: { exclude: ['updatedAt'] } }
});

module.exports = { CloudAuthorization: cloudAuthorization };
