const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/database');
const ProgressMonth = require('../../../enums/progress-month.enum');

const progress = sequelize.define('tbl_progress', {
  progressId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.TEXT, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  year: { type: DataTypes.INTEGER, allowNull: false },
  month: { 
    type: DataTypes.ENUM(...Object.values(ProgressMonth)), 
    allowNull: false 
  },
  hasPending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  isDelete: { type: DataTypes.BOOLEAN, defaultValue: false },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tbl_user',
      key: 'userId'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  idContractSystem: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'tbl_contract_systems',
      key: 'idContractSystem'
    }
  }
  
}, {
  timestamps: true,
  freezeTableName: true,
});

module.exports = { Progress: progress };
