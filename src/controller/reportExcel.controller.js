const reportExcelRouter = require('express').Router()
const LOG = require('../app/logger')
const authMiddleware = require('../middleware/session')
const reportService = require('../service/reportExcel.service')

reportExcelRouter.post('/report/excel', authMiddleware, async (req, res) => {
  try {
    // recibo el id de la evaluación, valido que el id de usuario sea del mismo profesor que hizo la evaluacion
    const idEvaluation = req.body.idEvaluacion
    // llamamos al servicio que busque en la tabla calificaciones
    const reportInfo = await reportService.findEvaluationScores(idEvaluation)
    if (reportInfo.error) {
      // Si se encontró un error, se devuelve el código de estado correspondiente
      return res.status(reportInfo.statusCode).json({ error: reportInfo.error, message: reportInfo.message })
    }
    LOG.info('Sending data')
    return res.status(200).json({ reportInfo })
  } catch (error) {
    LOG.error(`error al mostrar datos de evaluacion: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

reportExcelRouter.get('/report/excel/download/:idEvaluacion', authMiddleware, async (req, res) => {
  try {
    // recibo el id de la evaluación, valido que el id de usuario sea del mismo profesor que hizo la evaluacion
    const idEvaluation = req.params.idEvaluacion
    // llamamos al servicio que busque en la tabla calificaciones
    const reportInfo = await reportService.generateExcel(idEvaluation)
    if (reportInfo.error) {
      // Si se encontró un error, se devuelve el código de estado correspondiente
      return res.status(reportInfo.statusCode).json({ error: reportInfo.error, message: reportInfo.message })
    }
    res.setHeader('Content-Disposition', 'attachment; filename="reporte_evaluaciones.xlsx"')
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.send(reportInfo)
  } catch (error) {
    LOG.error(`error al mostrar datos de evaluacion: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = reportExcelRouter
