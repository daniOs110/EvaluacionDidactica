const ExcelJS = require('exceljs')
const resultEvaluations = require('../model/schema/evaluation.results.schema')
const LOG = require('../app/logger')

class ReportExcelService {
  async generateExcel (idEvaluation, evaluationTitle) {
    try {
    // Obtener los datos de la base de datos
      const evaluations = await resultEvaluations.findAll({
        where: {
          id_evaluacion: idEvaluation
        }
      })
      if (!evaluations > 0) {
        return { error: 'Any response answers found in data base', statusCode: 404, message: 'No se encontro información de respuestas asociadas a la evalaución.' }
      }
      // Crear un nuevo libro de trabajo
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet(`Reporte evaluación ${evaluationTitle}`)

      // necesitamos un servicio que nos traiga cuantas respuetas contesto bien cada usuario
      // tiene que separar si es usuario invitado consulta la tabla usuario invitado para traer nombre
      // si no consulta usuario registrado para traer nombre
      // Definir las columnas del Excel
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Nombre', key: 'nombre', width: 30 },
        { header: 'Respuestas correctas', key: 'respuestasCorrectas', width: 20 },
        { header: 'Porcentaje', key: 'porcentaje', width: 20 }
      ]

      // Agregar los datos al worksheet
      let i = 1
      evaluations.forEach(evaluation => {
        i++
        LOG.info('prueba')
        // separar si es usuario registrado o usuario invitado (traemos el nombre y apellidos si es que tiene)
        // llamamos al servicio que nos devuelva los datos
        // necesitamos un metodo que nos diga el numero total de preguntas, cuantas contesto bien el usuario y cuanto es el porcentaje
        worksheet.addRow({
          id: i,
          nombre: evaluation.name,
          respuestasCorrectas: evaluation.startDate,
          porcentaje: evaluation.endDate
        })
      })

      return workbook
    } catch (error) {
      console.error('Error generating Excel:', error)
      return { error: 'Error generating excel report', statusCode: 500, message: 'Ocurrio un error al generar el reporte excel.' }
    }
  }
}
module.exports = new ReportExcelService()
