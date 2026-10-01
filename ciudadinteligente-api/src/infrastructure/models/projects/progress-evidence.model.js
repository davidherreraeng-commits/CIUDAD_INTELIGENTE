const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');

const progressEvidence = sequelize.define('tbl_progress_evidence', {
    evidenceId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fileName: { type: DataTypes.STRING(255), allowNull: false },
    url: { type: DataTypes.TEXT, allowNull: false },
    blobName: { type: DataTypes.STRING(255), allowNull: false },
    mimeType: { type: DataTypes.STRING(50), allowNull: true },
    progressId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tbl_progress',
            key: 'progressId'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }
}, {
    timestamps: true,
    freezeTableName: true,
    defaultScope: {
        attributes: { exclude: ['updatedAt'] }
    },
});

module.exports = { ProgressEvidence: progressEvidence };