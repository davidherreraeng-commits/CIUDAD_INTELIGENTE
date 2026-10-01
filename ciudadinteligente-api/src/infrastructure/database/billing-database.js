// src/infrastructure/database/billing-database.js
const { Sequelize } = require('sequelize');

const billingSslEnabled = process.env.BILLING_DB_SSL !== 'false';

const billingSequelize = new Sequelize(
  process.env.BILLING_DB_NAME,
  process.env.BILLING_DB_USER,
  process.env.BILLING_DB_PASSWORD,
  {
    host: process.env.BILLING_DB_HOST,
    port: process.env.BILLING_DB_PORT,
    dialect: 'postgres',
    schema: process.env.BILLING_DB_SCHEMA,
    logging: false,
    dialectOptions: billingSslEnabled
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {}
  }
);

module.exports = { sequelize: billingSequelize };