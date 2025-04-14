// lambda.js
const serverless = require('serverless-http')
const app = require('./app') // Asegúrate de que la ruta es la correcta

module.exports.handler = serverless(app)
