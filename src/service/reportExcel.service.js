const resultEvaluations = require('../model/schema/evaluation.results.schema')
const scoreEvaluation = require('../model/schema/score.schema')
const guestUser = require('../model/schema/guest.user.schema')
const registerUser = require('../model/schema/user.info.schema')
const evaluationInfo = require('../model/schema/evaluation.schemas')
const XLSX = require('xlsx')
const fs = require('fs')
const LOG = require('../app/logger')

class ReportExcelService {
  constructor () {
    this.resultScoreEvaluations = []
    this.reportInfo = []
  }

  async generateExcel (idEvaluation) {
    try {
      // Obtener los datos de la base de datos
      const reportExcelInfo = await this.findEvaluationScores(idEvaluation)
      if (!reportExcelInfo || !reportExcelInfo.report || reportExcelInfo.report.length === 0) {
        return { error: 'No data for excel report', statusCode: 404, message: 'No se encontro información para llenar el archivo excel' }
      }
      const { titleEvaluation, totalQuestions, report } = reportExcelInfo
      // Crear un nuevo libro de trabajo
      const workbook = XLSX.utils.book_new()

      // Crear una hoja de trabajo con un título en las primeras celdas
      const worksheetData = [
        ['Reporte de Evaluaciones'],
        [titleEvaluation],
        [],
        ['ID', 'Nombre Completo', 'Respuestas Correctas', 'Preguntas totales', 'Porcentaje']
      ]

      // Agregar datos del array `resultScoreEvaluations`
      report.forEach(scoreInfo => {
        const formattedPorcentaje = scoreInfo.porcentaje.toFixed(2)
        worksheetData.push([
          scoreInfo.idReporte,
          scoreInfo.nombreCompleto,
          scoreInfo.respuestasCorrectas,
          totalQuestions,
          `${formattedPorcentaje}%`
        ])
      })

      // Crear una hoja de trabajo a partir de los datos
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

      // Establecer estilos para la hoja de trabajo
      const styles = {
        header: {
          font: { bold: true },
          fill: { fgColor: { rgb: 'FFA500' } } // Color de fondo naranja
        },
        data: {
          fill: { fgColor: { rgb: 'FFFF00' } } // Color de fondo amarillo para datos
        }
      }
      // Convertir la hoja de trabajo en un array de objetos JavaScript
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      // Aplicar estilos a las celdas
      data.forEach((row, rowIndex) => {
        row.forEach((cell, columnIndex) => {
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })
          if (rowIndex < 4) {
            // Estilo para las celdas de título y encabezado
            worksheet[cellRef].s = styles.header
          } else {
            // Estilo para las celdas de datos
            worksheet[cellRef].s = styles.data
          }
        })
      })

      // Agregar la hoja de trabajo al libro de trabajo
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte')

      // Generar el archivo Excel en un buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      return excelBuffer
    } catch (error) {
      console.error('Error generating Excel:', error)
      return { error: 'Error generating excel report', statusCode: 500, message: 'Ocurrio un error al generar el reporte excel.' }
    }
  }

  async findEvaluationScores (idEvaluation) {
    this.resultScoreEvaluations = []
    const evaluations = await scoreEvaluation.findAll({
      where: {
        id_evaluacion: idEvaluation
      }
    })
    if (!evaluations.length > 0) {
      return { error: 'Any response answers found in data base', statusCode: 404, message: 'No se encontro información de respuestas asociadas a la evalaución.' }
    }
    const infoEvaluation = await evaluationInfo.findByPk(idEvaluation)
    if (!infoEvaluation) {
      return { error: 'Id evaluation not exist', statusCode: 404, message: 'No se encontro información de evaluación.' }
    }
    const titleEvaluation = infoEvaluation.nombre
    let idReport = 0
    let totalQuestions = 0
    LOG.debug(`The title of evaluation is: ${titleEvaluation}`)
    for (const evaluation of evaluations) {
      idReport = idReport + 1
      const idGuestUser = evaluation.id_usuario_invitado
      const idRegisterUser = evaluation.id_usuario_registrado

      // const idEvaluationFound = evaluation.id_evaluacion
      const scoreCorrectAnswers = evaluation.correcta
      totalQuestions = evaluation.total_pregunta
      let userName = null
      let firstName = null
      let secondName = null
      let finalName = null
      let percentaje = 0
      if (idGuestUser !== null && idGuestUser !== undefined) {
        LOG.debug(`guest user id ${idGuestUser}, correct answers ${scoreCorrectAnswers} total questions ${totalQuestions} `)
        const user = await guestUser.findByPk(idGuestUser)
        finalName = user.nombre
        LOG.debug(`Data to send is username ${finalName}, `)
      } else if (idRegisterUser !== null && idRegisterUser !== undefined) {
        LOG.debug(`register user id ${idRegisterUser}, correct answers ${scoreCorrectAnswers} total questions ${totalQuestions} `)
        const user = await registerUser.findByPk(idRegisterUser)
        userName = user.nombre
        firstName = user.apellido_paterno
        secondName = user.apellido_materno
        function isValid (value) {
          return value !== null && value !== undefined && value.trim() !== ''
        }
        // concatenar el nombre
        const fullName = [
          isValid(userName) ? userName : '',
          isValid(firstName) ? firstName : '',
          isValid(secondName) ? secondName : ''
        ].filter(Boolean).join(' ')
        finalName = fullName
        LOG.debug(`Data to send is username ${fullName}, and final name is: ${finalName}`)
      } else {
        return { error: 'Any response userName found in data base', statusCode: 404, message: 'No se encontro información de nombre asociadas a la id de usuario.' }
      }
      // Validar que los parámetros no sean nulos, indefinidos o negativos
      if (scoreCorrectAnswers == null || totalQuestions == null) {
        return { error: `Los parámetros respuesta de usuario ${scoreCorrectAnswers} y preguntas totales ${scoreCorrectAnswers} no pueden ser nulos o indefinidos`, statusCode: 404, message: 'El total de preguntas no puede ser cero.' }
      }

      if (scoreCorrectAnswers < 0 || !totalQuestions > 0) {
        return { error: 'El total de preguntas y respuestas correctas no pueden ser menor a cero', statusCode: 404, message: 'El total de preguntas no puede ser cero.' }
      }
      // operación
      percentaje = ((scoreCorrectAnswers * 100) / totalQuestions)
      LOG.info(`El porcentaje es ${percentaje}`)
      const scoreInfo = {
        idReporte: idReport,
        nombreCompleto: finalName,
        respuestasCorrectas: scoreCorrectAnswers,
        porcentaje: percentaje
      }
      this.resultScoreEvaluations.push(scoreInfo)
    }
    LOG.debug('Finish the iteration')
    return { titleEvaluation, totalQuestions, report: this.resultScoreEvaluations.sort((a, b) => b.porcentaje - a.porcentaje) }
  }
}
module.exports = new ReportExcelService()
