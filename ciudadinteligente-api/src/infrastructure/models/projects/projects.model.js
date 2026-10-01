const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');

const projects = sequelize.define('tbl_projects', {
  projectsId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false }
}, {
  timestamps: true,
  freezeTableName: true,
  defaultScope: {
    attributes: { exclude: ['updatedAt'] }
  },
});

module.exports = { Projects: projects };