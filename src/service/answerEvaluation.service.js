const resultEvaluations = require('../model/schema/evaluation.results.schema')
const sequelize = require('../config/database')
const LOG = require('../app/logger')
const { format } = require('date-fns')
const { formatInTimeZone } = require('date-fns-tz')

class AnswerEvaluationService {
  constructor () {
    this.resultEvaluations = []
  }

  typeUserId (typeUser, user) {
    let idUser
    switch (typeUser) {
      case 'REGISTER':
        LOG.info(`The user is ${typeUser}`)
        idUser = user.get('id_info_usuario')
        return idUser
      case ('GUEST'):
        LOG.info(`The user is ${typeUser}`)
        idUser = user.get('id_usuarios_invitados')
        return idUser
      default:
        LOG.error(`Type of user not recognized ${typeUser}`)
        return { error: `Error type of user: ${typeUser} not recognize`, statusCode: 404, message: `El tipo de usuario ingresado: ${typeUser} no se reconoce` }
    }
  }

  async alreadyAnswered (idEvaluation, idUser, typeUser) {
    let transaction
    LOG.debug(`Entre a already answered con mi idEvaluacion ${idEvaluation}, id usuario: ${idUser} y el tipo de usuario ${typeUser}`)
    try {
      transaction = await sequelize.transaction()
      let userRegisterAnswer = null
      if (typeUser === 'REGISTER') {
        LOG.info('Checking service already answer by register user')
        userRegisterAnswer = await resultEvaluations.findOne({
          where: {
            id_evaluacion: idEvaluation,
            id_usuario_registrado: idUser
          }
        }, { transaction })
        LOG.debug('Termine de buscar un usuario en la tabla registrado')
      } else if (typeUser === 'GUEST') {
        LOG.info('Checking service already answer by guest user ')
        userRegisterAnswer = await resultEvaluations.findOne({
          where: {
            id_evaluacion: idEvaluation,
            id_usuario_invitado: idUser
          }
        }, { transaction })
        LOG.debug('Termine de buscar un usuario en la tabla invitado')
      } else {
        await transaction.rollback()
        return { error: `Error type of user: ${typeUser} not exist`, statusCode: 500, message: `El tipo de usuario ingresado: ${typeUser} no existe` }
      }
      LOG.debug(`User register search = ${userRegisterAnswer}`)
      if (userRegisterAnswer === null || userRegisterAnswer === undefined) {
        // no encontro que el usuario haya respondido la evalaucion antes
        await transaction.commit()
        LOG.info('The user didnt response de evaluation before, he could conitnue')
        return { statusCode: 200, message: 'El usuario no ha respondido la evaluación anteriormente, puede continuar.', data: 'all good' }
        // return { error: `user: ${idUser} not exist`, statusCode: 404, message: `El tipo de usuario ingresado: ${typeUser} no existe o no se encontro en base de datos` }
      }
      if (userRegisterAnswer) {
        await transaction.commit()
        LOG.error(`The user already response the evaluation and the lenght of array is ${userRegisterAnswer.length}`)
        return { error: 'The user already response the evaluation', statusCode: 409, message: 'El usuario ya respondio la evaluación.' }
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
    const timeZone = 'America/Mexico_City' // recomendable cambiarlo en variables de entorno a futuro
    let transaction
    const currentDate = new Date()
    const currentTime = formatInTimeZone(currentDate, timeZone, 'HH:mm:ss')
    // const currentTime = currentDate.toTimeString().split(' ')[0]
    LOG.debug(`la fecha actual es ${currentDate} y la hora actual es ${currentTime}`)

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

  async statusItemAnswer (answersUser, typeUser, idUser, activityInfo, idEvaluation) {
    let statusAnswer
    let answerSaved

    for (const activity of activityInfo) {
      const idOrdenamiento = activity.id_ordenamiento
      const oracion = activity.oracion
      const idEvaluacion = activity.id_evaluacion
      const numPregunta = activity.num_pregunta
      // const orden = activity.orden
      const evaluation = {
        id_resultado_evaluaciones: answerSaved.id_resultado_evaluaciones,
        id_ordenamiento: idOrdenamiento,
        oracion: this.splitSentence(oracion),
        id_evaluacion: idEvaluacion,
        num_pregunta: numPregunta,
        correcta: statusAnswer
        // oracion_usuario: this.splitSentence(oracionUsuario)
      }
      this.resultEvaluations.push(evaluation)
    }
    let arrayUserAnswer

    for (const key of Object.keys(answersUser)) {
      const question = answersUser[key]
      arrayUserAnswer = question.answer
      LOG.debug(`Question Number: ${question.numPregunta}`)
      LOG.debug(`Answers: ${arrayUserAnswer}`)
      // llamamos a un servicio para que nos diga si esta en orden el array
      statusAnswer = this.isArrayOrder(arrayUserAnswer)
      const arraySaved = JSON.stringify(arrayUserAnswer)
      LOG.info(`La pregunta ${question.numPregunta} tiene el estatus correcto: ${statusAnswer}`)
      try {
        answerSaved = await this.saveData(typeUser, idUser, idEvaluation, question.numPregunta, statusAnswer, arraySaved)
      } catch (error) {
        LOG.error(`error al guardar respuestas de usuario: ${error.message}`)
        return { error: 'Error saving user answers', statusCode: 500, message: 'Las respuestas que ingreso el usuario no se pudieron almacenar.' }
      }
    }
    return this.resultEvaluations.sort((a, b) => a.num_pregunta - b.num_pregunta)
  }

  isArrayOrder (array) {
    let valueUser
    for (let i = 0; i < (array.length); i++) {
      valueUser = array[i]
      LOG.debug(`i = ${i} y el valor del array es ${valueUser}`)
      if (valueUser !== (i + 1)) {
        // el array no esta en orden
        return false
      }
    }
    // EL array esta en orden
    return true
  }

  async statusAnswer (activityInfo, answersUser, typeUser, idUser) {
    LOG.info(`status answer devuelve ${this.resultEvaluations}`)
    // debo guardar en resultados_evaluaciones cada respuesta
    LOG.info('Entrando al servicio status answer')
    this.resultEvaluations = []
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

    return this.resultEvaluations.sort((a, b) => a.num_pregunta - b.num_pregunta)
  }
}

module.exports = new AnswerEvaluationService()
