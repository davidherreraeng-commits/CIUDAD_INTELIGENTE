const Sequelize = require("sequelize");
const config = require("../../../config/config");

// Crear instancia de Sequelize (NO cargar modelos aquí)
const sequelize = new Sequelize(
  config.dbConfig.database,
  config.dbConfig.username,
  config.dbConfig.password,
  {
    host: config.dbConfig.host,
    port: config.dbConfig.port,
    dialect: config.dbConfig.dialect,
    logging: console.log, // Opcional: ver todos los logs SQL
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      schema: config.dbConfig.schema,   // Schema de la DB
    },
    dialectOptions: config.dbConfig.ssl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  }
);

// Exportar instancia (NO sync, NO modelos, NO relaciones)
module.exports = {
  sequelize,
};