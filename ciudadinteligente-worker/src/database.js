require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.BILLING_DB_NAME,
  process.env.BILLING_DB_USER,
  process.env.BILLING_DB_PASSWORD,
  {
    host: process.env.BILLING_DB_HOST,
    port: process.env.BILLING_DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    },
    schema: process.env.BILLING_DB_SCHEMA
  }
);

module.exports = { sequelize };