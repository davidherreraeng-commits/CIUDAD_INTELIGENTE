const config = {
  port: process.env.APP_PORT,
  env: process.env.APP_ENV,

  JWTSecret: process.env.JWT_SECRET,
  ExpiresIn: process.env.JWT_EXPIRE,

  corsOrigin: process.env.CORS_ORIGIN,

  dbConfig: {
    dialect: process.env.DB_CONNECTION,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    schema: process.env.DB_SCHEMA,
    ssl: process.env.DB_SSL === 'true',
    synchronize: process.env.DB_SYNCRHONIZE === 'true',
  },

  mailConfig: {
    url: process.env.SERVICESMAIL_URL,
    user: process.env.SERVICESMAIL_USER,
    password: process.env.SERVICESMAIL_PASSWORD,
    clientId: process.env.SERVICESMAIL_CLIENT_ID,
    clientSecret: process.env.SERVICESMAIL_CLIENT_SECRET,
    host: process.env.SERVICESMAIL_HOST,
    port: process.env.SERVICESMAIL_PORT,
    from: process.env.SERVICESMAIL_FROM,
    token: process.env.SERVICESMAIL_TOKEN,
    cookie: process.env.SERVICESMAIL_COOKIE,
  }
}

module.exports = config
