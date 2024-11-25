const express = require('express');
const { dbConexion } = require('./src/database/config');
const rutasCredito = require('./src/routes/rutasCredito'); // Importar las rutas
const cors = require('cors')
require('dotenv').config()

const app = express();
app.use(cors())

dbConexion()

app.use(express.static('public'))
app.use(express.json()); // Habilita manejo de JSON
app.use('/', rutasCredito);

app.listen(process.env.PORT, () => {
    console.log('Server running on port 4000');
})