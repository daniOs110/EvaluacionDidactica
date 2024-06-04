const reportExcelRouter = require('express').Router()
const LOG = require('../app/logger')
const authMiddleware = require('../middleware/session')
const { matchedData } = require('express-validator')

reportExcelRouter.post('report/excel', authMiddleware, async (req, res) => {
  try {
    // recibo el id de la evaluación, valido que el id de usuario sea del mismo profesor que hizo la evaluacion
    const idEvaluation = req.body.idEvaluacion

    // llamamos al servicio
  } catch (error) {
    LOG.error(`error al mostrar datos de evaluacion: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = reportExcelRouter
