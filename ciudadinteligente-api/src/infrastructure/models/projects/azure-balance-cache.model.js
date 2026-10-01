const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database/billing-database.js');

/**
 * Caché en BD del balance de créditos por contrato/mes (Microsoft.Consumption
 * /balances). Objetivo: no pegarle a la Balances API real en cada consulta
 * del reporte "Créditos por Contrato" (que puede tardar y se cae si hay
 * muchas consultas simultáneas).
 *
 * Reglas de uso (ver azure-balances.service.js -> getCachedBalance):
 *   - Mes cerrado ya guardado aquí: se sirve siempre de esta tabla, nunca se
 *     vuelve a consultar Azure (un mes cerrado no cambia).
 *   - Mes vigente: se sirve de aquí si `updatedAt` tiene menos de 1 día;
 *     si no, se refresca contra Azure y se actualiza la fila.
 *
 * `createdAt`/`updatedAt` son las columnas de auditoría (cuándo se guardó
 * por primera vez / la última vez), manejadas automáticamente por Sequelize.
 *
 * IMPORTANTE: la tabla NO se crea con sync() — hay que correr el script SQL
 * "sql/create-tbl-azure-balances.sql" una vez contra la BD de billing.
 */
const AzureBalanceCache = sequelize.define('AzureBalanceCache', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  billingAccountId: { type: DataTypes.STRING, allowNull: false },
  // Formato "YYYYMM", ej. "202606" para junio 2026.
  billingPeriodName: { type: DataTypes.STRING(6), allowNull: false },
  beginningBalance: { type: DataTypes.DECIMAL },
  endingBalance: { type: DataTypes.DECIMAL },
  newPurchases: { type: DataTypes.DECIMAL },
  adjustments: { type: DataTypes.DECIMAL },
  utilized: { type: DataTypes.DECIMAL },
  currency: { type: DataTypes.STRING(10), defaultValue: 'USD' },
}, {
  tableName: 'tbl_azure_balances',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['billingAccountId', 'billingPeriodName'] },
  ]
});

module.exports = AzureBalanceCache;
