require('dotenv').config()
require('./src/infrastructure/models');

const express = require("express");
const cors = require("cors");

const config = require('./config/config')
const routes = require('./src/routes/routes')

const app = express();

// const { sequelize } = require('./src/infrastructure/database/database');

// sequelize.authenticate()
//   .then(() => {
//     console.log("Conexión establecida.");
//     return sequelize.sync({ alter: true });
//   })
//   .then(() => console.log("Sincronización completada."))
//   .catch(console.error);

app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
	res.send('Running...');
});

app.use('/api', routes);

app.listen(config.port, () => {
  console.log(`Server on environment ${config.env} running on port ${config.port}`);
});
