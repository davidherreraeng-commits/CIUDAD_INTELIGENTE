require('dotenv').config();
const cron = require('node-cron');
const { syncHistoricalBilling } = require('./worker');

// Leemos la variable de entorno, si no existe, usamos las 2:00 AM por defecto
const cronTime = process.env.CRON_SCHEDULE || '0 2 * * *';

// Pasamos la variable al scheduler
cron.schedule(cronTime, async () => {
  await syncHistoricalBilling();
});