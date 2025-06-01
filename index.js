// lambda.js
const serverless = require('serverless-http')
const app = require('./src/app/app') // Asegúrate de que la ruta es la correcta

module.exports.handler = serverless(app)
