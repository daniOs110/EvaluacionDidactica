const resultEvaluations = require('../model/schema/evaluation.results.schema')
const sequelize = require('../config/database')
const LOG = require('../app/logger')

class AnswerEvaluationService {
  constructor () {
    this.resultEvaluations = []
  }

  async alreadyAnswered (idEvaluation, idUser, typeUser) {
    let transaction

    try {
      transaction = await sequelize.transaction()
      let userRegisterAnswer = null
      if (typeUser === 'REGISTER') {
        LOG.info('Checking service already answer by register user')
        userRegisterAnswer = await resultEvaluations.findAll({
          where: {
            id_evaluacion: idEvaluation,
            id_usuario_registrado: idUser
          }
        }, { transaction })
      } else if (typeUser === 'GUEST') {
        LOG.info('Checking service already answer by guest user ')
        userRegisterAnswer = await resultEvaluations.findAll({
          where: {
            id_evaluacion: idEvaluation,
            id_usuario_invitado: idUser
          }
        }, { transaction })
      } else {
        return { error: `Error type of user: ${typeUser} not exist`, statusCode: 500, message: `El tipo de usuario ingresado: ${typeUser} no existe` }
      }
      if (userRegisterAnswer.length > 0) {
        await transaction.commit()
        LOG.error(`The user already response the evaluation and the lenght of array is ${userRegisterAnswer.length}`)
        return { error: 'The user already response the evaluation', statusCode: 409, message: 'El usuario ya respondio la evaluación.' }
      } else {
        LOG.info('The user didnt response de evaluation before, he could conitnue')
        return 'all good'
      }
    } catch (error) {
      LOG.error(`Ocurrio un error al buscar si el usuario habia respondido la evaluación, error: ${error}`)
      if (transaction) await transaction.rollback()
      return { error: 'Error finding already answer user', statusCode: 500, message: 'Ocurrio un error al buscar si el usuario habia respondido la evaluación.' }
    }
  }

  evaluateAnswer (correctSentence, userSentence) {
    const status = correctSentence.trim() === userSentence.trim()
    LOG.info(`checking response status ${correctSentence} = ${userSentence}, status: ${status}`)
    return status
  }

  async saveData (typeUser, idUser, idEvaluation, idSortSentence, statusAnswer, userSentence) {
    /**
     * idUsuario
     * idEvaluacion
     * idPreguntaOrdenamiento
     * status
     * oracionUsuario
     * Date
     * Time
     */
    let transaction
    const currentDate = new Date()
    const currentTime = currentDate.toLocaleTimeString()

    try {
      transaction = await sequelize.transaction()
      let newAnswer = null
      if (typeUser === 'REGISTER') {
        newAnswer = await resultEvaluations.create({
          id_usuario_registrado: idUser,
          fecha: currentDate,
          hora: currentTime,
          id_evaluacion: idEvaluation,
          id_pregunta_ordenamiento: idSortSentence,
          status: statusAnswer,
          oracion_usuario: userSentence
        }, { transaction })
      } else {
        // GUEST USER
        newAnswer = await resultEvaluations.create({
          id_usuario_invitado: idUser,
          fecha: currentDate,
          hora: currentTime,
          id_evaluacion: idEvaluation,
          id_pregunta_ordenamiento: idSortSentence,
          status: statusAnswer,
          oracion_usuario: userSentence
        }, { transaction })
      }

      await transaction.commit()
      LOG.info('Saving data into resultEvaluations table')
      return { newAnswer }
    } catch (error) {
      LOG.error(`Ocurrio un error al crear la evaluación, error: ${error}`)
      if (transaction) await transaction.rollback()
      return { error: 'Error saving user answers', statusCode: 500, message: 'Las respuestas que ingreso el usuario no se pudieron almacenar.' }
    }
  }

  splitSentence (sentence) {
    const words = sentence.split(' ')
    for (let i = 0; i < words.length; i++) {
      if ((words.length - 1) === i) {
        LOG.info(`La ultima palabra es: ${words[i]}`)
        if (words[i].length < 3) {
          LOG.info(`La ultima palabra ${words[i]} es menor o igual a 2 caracteres `)
          words[i - 1] = words[i - 1] + ' ' + words[i]
          words.splice(i, 1) // delete word < 2
        }
      } else if (words[i].length < 3) {
        LOG.info(`La palabra ${words[i]} es menor o igual a 2 caracteres `)
        words[i + 1] = words[i] + ' ' + words[i + 1]
        words.splice(i, 1) // delete word < 2
      }
    }
    return words
  }

  async statusAnswer (activityInfo, answersUser, typeUser, idUser) {
    LOG.info(`status answer devuelve ${this.resultEvaluations}`)
    // debo guardar en resultados_evaluaciones cada respuesta
    LOG.info('entrando al servicio status answer')
    // iterando sobre las respuestas correctas
    for (const activity of activityInfo) {
      // const { idOrdenamiento, oracion, idEvaluacion, numPregunta, orden } = activity

      const idOrdenamiento = activity.id_ordenamiento
      const oracion = activity.oracion
      const idEvaluacion = activity.id_evaluacion
      const numPregunta = activity.num_pregunta
      const orden = activity.orden

      let oracionUsuario = null
      let correctaEstatus = null

      if (typeof answersUser === 'object' && answersUser !== null) {
        if (answersUser.hasOwnProperty(numPregunta)) {
          oracionUsuario = answersUser[numPregunta]

          correctaEstatus = this.evaluateAnswer(oracion, oracionUsuario)
        }
      } else {
        return { error: 'Bad format user sentence', statusCode: 404, message: 'Las respuestas que ingreso el usuario no son un objeto json.' }
      }
      let answerSaved = null
      try {
        answerSaved = await this.saveData(typeUser, idUser, idEvaluacion, idOrdenamiento, correctaEstatus, oracionUsuario)
      } catch (error) {
        LOG.error(`error al guardar respuestas de usuario: ${error.message}`)
        return { error: 'Error saving user answers', statusCode: 500, message: 'Las respuestas que ingreso el usuario no se pudieron almacenar.' }
      }
      const evaluation = {
        id_resultado_evaluaciones: answerSaved.id_resultado_evaluaciones,
        id_ordenamiento: idOrdenamiento,
        oracion: this.splitSentence(oracion),
        id_evaluacion: idEvaluacion,
        num_pregunta: numPregunta,
        correcta: correctaEstatus,
        oracion_usuario: this.splitSentence(oracionUsuario)
      }
      this.resultEvaluations.push(evaluation)
    }
    return this.resultEvaluations
  }
}

module.exports = new AnswerEvaluationService()
