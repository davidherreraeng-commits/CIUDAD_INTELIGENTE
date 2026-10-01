const { DataTypes } = require('sequelize');
const { sequelize } = require('./database.js');

const AzureSubscriptionMapping = sequelize.define('AzureSubscriptionMapping', {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  azureSubscriptionName: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    comment: 'Nombre original que viene en el CSV de Azure'
  },
  projectFriendlyName: { 
    type: DataTypes.STRING, 
    allowNull: false,
    comment: 'Nombre legible para el frontend (Ej. Proyecto Ciudad Inteligente)'
  }
},{
  tableName: 'tbl_subscription_mappings',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['azureSubscriptionName']
    }
  ]
});

module.exports = AzureSubscriptionMapping;