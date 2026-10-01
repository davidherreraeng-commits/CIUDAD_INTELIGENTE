const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');

const cloudAttachments = sequelize.define('tbl_cloud_attachments', {
  attachmentId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  authId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'tbl_cloud_authorizations', key: 'authId' }
  },
  fileName: { type: DataTypes.STRING(255), allowNull: false },
  url: { type: DataTypes.TEXT, allowNull: false },
  blobName: { type: DataTypes.STRING(255), allowNull: false },
  mimeType: { type: DataTypes.STRING(255), allowNull: true },
}, {
  timestamps: true,
  freezeTableName: true,
});

module.exports = { CloudAttachments: cloudAttachments };
