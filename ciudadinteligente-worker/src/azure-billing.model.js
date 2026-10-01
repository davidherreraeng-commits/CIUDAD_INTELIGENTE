 const { DataTypes } = require('sequelize');
const { sequelize } = require('./database.js');

const AzureBilling = sequelize.define('AzureBilling', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  resourceId: { type: DataTypes.TEXT },
  resourceGroupName: { type: DataTypes.STRING },
  serviceName: { type: DataTypes.STRING },
  billedCost: { type: DataTypes.DECIMAL }, 
  consumedQuantity: { type: DataTypes.DECIMAL },
  currency: { type: DataTypes.STRING(10), defaultValue: 'USD' },
  regionName: { type: DataTypes.STRING },
  chargePeriodStart: { type: DataTypes.DATE },
  chargePeriodEnd: { type: DataTypes.DATE },
  sourceFilename: { type: DataTypes.STRING, allowNull: false },
  subAccountName: { type: DataTypes.STRING },
  projectFriendlyName: { type: DataTypes.STRING, allowNull: true },
  bolsaOrigen: { type: DataTypes.STRING, allowNull: false }, 
  tags: { type: DataTypes.JSONB } 
}, {
  tableName: 'tbl_billing',
  timestamps: true,
  indexes: [
    { fields: ['sourceFilename'] },
    { fields: ['subAccountName'] },
    { fields: ['bolsaOrigen'] }
  ]
});

module.exports = AzureBilling;