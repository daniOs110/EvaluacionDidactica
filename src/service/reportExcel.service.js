// const ExcelJS = require('exceljs')
const resultEvaluations = require('../model/schema/evaluation.results.schema')
const scoreEvaluation = require('../model/schema/score.schema')
const guestUser = require('../model/schema/guest.user.schema')
const registerUser = require('../model/schema/user.info.schema')
const evaluationInfo = require('../model/schema/evaluation.schemas')
const LOG = require('../app/logger')

class ReportExcelService {
  constructor () {
    this.resultScoreEvaluations = []
  }

  /* async generateExcel (idEvaluation, evaluationTitle) {
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
  } */

  async findEvaluationScores (idEvaluation) {
    this.resultScoreEvaluations = []
    const evaluations = await scoreEvaluation.findAll({
      where: {
        id_evaluacion: idEvaluation
      }
    })
    if (!evaluations > 0) {
      return { error: 'Any response answers found in data base', statusCode: 404, message: 'No se encontro información de respuestas asociadas a la evalaución.' }
    }
    const infoEvaluation = await evaluationInfo.findByPk(idEvaluation)
    const titleEvaluation = infoEvaluation.nombre
    let idReport = 0
    LOG.debug(`The title of evaluation is: ${titleEvaluation}`)
    for (const evaluation of evaluations) {
      idReport = idReport + 1
      const idGuestUser = evaluation.id_usuario_invitado
      const idRegisterUser = evaluation.id_usuario_registrado
      // const idEvaluationFound = evaluation.id_evaluacion
      const scoreCorrectAnswers = evaluation.correcta
      const totalQuestions = evaluation.total_pregunta
      let userName = null
      let firstName = null
      let secondName = null
      let finalName = null
      let percentaje = 0
      if (idGuestUser !== null || idGuestUser !== undefined) {
        LOG.debug(`guest user id ${idGuestUser}, correct answers ${scoreCorrectAnswers} total questions ${totalQuestions} `)
        const user = await guestUser.findByPk(idGuestUser)
        finalName = user.nombre
        LOG.debug(`Data to send is username ${userName}, `)
      } else if (idRegisterUser !== null || idRegisterUser !== undefined) {
        LOG.debug(`register user id ${idRegisterUser}, correct answers ${scoreCorrectAnswers} total questions ${totalQuestions} `)
        const user = await registerUser.findByPk(idGuestUser)
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
    return { titleEvaluation, report: this.resultScoreEvaluations.sort((a, b) => b.porcentaje - a.porcentaje) }
  }
}
module.exports = new ReportExcelService()
