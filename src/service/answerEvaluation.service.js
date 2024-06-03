const resultEvaluations = require('../model/schema/evaluation.results.schema')
const sequelize = require('../config/database')
const LOG = require('../app/logger')
const { format } = require('date-fns')
const { formatInTimeZone } = require('date-fns-tz')

class AnswerEvaluationService {
  constructor () {
    this.resultEvaluations = []
    this.resultItemsEvaluations = []
    this.resultCrossWordEvaluations = []
    this.resultMultipleChoiceEvaluations = []
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
        LOG.info('The user didnt response de evaluation before, he could continue')
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

  async saveDataQuestionAnswer (typeUser, idUser, idEvaluation, idQuestion, statusAnswer, userSentence) {
    /**
     * idUsuario
     * idEvaluacion
     * idPregunta
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
          id_pregunta: idQuestion,
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
          id_pregunta: idQuestion,
          status: statusAnswer,
          oracion_usuario: userSentence
        }, { transaction })
      }

      await transaction.commit()
      LOG.info('Saving data into resultEvaluations table for dinamic question answer')
      return { newAnswer }
    } catch (error) {
      LOG.error(`Ocurrio un error al crear la evaluación, error: ${error}`)
      if (transaction) await transaction.rollback()
      return { error: 'Error saving user answers', statusCode: 500, message: 'Las respuestas que ingreso el usuario no se pudieron almacenar.' }
    }
  }

  async saveDataMultipleChoice (typeUser, idUser, idEvaluation, idQuestion, statusAnswer, userSentence, idAnswerDb) {
    /**
     * idUsuario
     * idEvaluacion
     * idPregunta
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
          id_respuesta_seleccionada: idAnswerDb,
          id_usuario_registrado: idUser,
          fecha: currentDate,
          hora: currentTime,
          id_evaluacion: idEvaluation,
          id_pregunta: idQuestion,
          status: statusAnswer,
          oracion_usuario: userSentence
        }, { transaction })
      } else {
        // GUEST USER
        newAnswer = await resultEvaluations.create({
          id_respuesta_seleccionada: idAnswerDb,
          id_usuario_invitado: idUser,
          fecha: currentDate,
          hora: currentTime,
          id_evaluacion: idEvaluation,
          id_pregunta: idQuestion,
          status: statusAnswer,
          oracion_usuario: userSentence
        }, { transaction })
      }

      await transaction.commit()
      LOG.info('Saving data into resultEvaluations table for dinamic question answer')
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

    LOG.info('Entrando al servicio status item answer')
    this.resultItemsEvaluations = []
    let arrayUserAnswer
    let answerSaved
    for (const key of Object.keys(answersUser)) {
      const question = answersUser[key]
      arrayUserAnswer = question.answer
      const numQuestion = question.numPregunta
      LOG.debug(`Question Number: ${numQuestion}`)
      LOG.debug(`Answers: ${arrayUserAnswer}`)
      // llamamos a un servicio para que nos diga si esta en orden el array
      statusAnswer = this.isArrayOrder(arrayUserAnswer)
      const arraySaved = JSON.stringify(arrayUserAnswer)
      LOG.info(`La pregunta ${numQuestion} tiene el estatus correcto: ${statusAnswer}`)
      // filtro mi array de actividades de ordenamiento para solo mostrar las que coinciden con el numero de pregunta
      const filteredActivities = activityInfo.filter(activity => activity.num_pregunta === numQuestion)
      if (!filteredActivities.length > 0) {
        return { error: `Not activities asociated with quetion ${numQuestion}`, statusCode: 404, message: 'No se encontraron items asociados a la rpegunta' }
      }
      // Crear el array respuestasCorrectas
      const respuestasCorrectas = filteredActivities.map(activity => {
        return {
          id: activity.orden, // o activity.id_ordenamiento dependiendo de lo que necesites
          texto: activity.oracion
        }
      })
      const respuestasMap = new Map(respuestasCorrectas.map(respuesta => [respuesta.id, respuesta.texto]))

      const respuestasUsuario = arrayUserAnswer.map(id => {
        return {
          id,
          texto: respuestasMap.get(id) || 'Texto no encontrado'
        }
      })

      try {
        answerSaved = await this.saveData(typeUser, idUser, idEvaluation, filteredActivities[0].id_ordenamiento, statusAnswer, arraySaved)
      } catch (error) {
        LOG.error(`error al guardar respuestas de usuario: ${error.message}`)
        return { error: 'Error saving user answers', statusCode: 500, message: 'Las respuestas que ingreso el usuario no se pudieron almacenar.' }
      }
      const evaluation = {
        num_pregunta: numQuestion,
        id_resultado_evaluaciones: answerSaved.id_resultado_evaluaciones,
        descripcion: filteredActivities[0].instruccion,
        correcta: statusAnswer,
        respuestasCorrectas,
        respuestasUsuario
      }
      this.resultItemsEvaluations.push(evaluation)
    }
    // return null
    return this.resultItemsEvaluations.sort((a, b) => a.num_pregunta - b.num_pregunta)
  }

  isArrayOrder (array) {
    let valueUser
    for (let i = 0; i < (array.length); i++) {
      valueUser = array[i]
      LOG.debug(`i = ${i} y el valor del array es ${valueUser}`)
      if (valueUser !== (i)) {
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

  async statusCrossWordAnswer (answersUser, typeUser, idUser, activityInfo, idEvaluation) {
    LOG.info('Entrando al servicio status crossWord answer')
    this.resultCrossWordEvaluations = []

    // recorrer respuestas usuario
    const userAnswersMap = new Map()
    for (const key of Object.keys(answersUser)) {
      const question = answersUser[key]
      const userAnswer = question.answer
      const position = question.position
      LOG.debug(`Question Number: ${position} and key ${question}`)
      LOG.debug(`Answers: ${userAnswer}`)
      userAnswersMap.set(position, userAnswer)
    }
    // recorrer respuestas correctas
    const correctAnswersMap = new Map()

    for (const activity of activityInfo.resultWordSearchEvaluation) {
      const idQuestionDb = activity.idQuestionDb
      const position = activity.position
      const clue = activity.clue
      const answer = activity.answers[0].answer // Asumiendo que siempre hay una respuesta en el array answers
      const orientation = activity.answers[0].orientation
      const startx = activity.answers[0].startX
      const starty = activity.answers[0].startY
      LOG.debug(`Question Number correct: ${position}`)
      LOG.debug(`correct answers: ${answer} and id db is ${idQuestionDb}`)
      correctAnswersMap.set(position, [answer, idQuestionDb, clue, orientation, startx, starty])
    }
    for (const [position, userAnswer] of userAnswersMap) {
      const [correctAnswer, idQuestionDb, clue, orientation, startx, starty] = correctAnswersMap.get(position)

      if (correctAnswer === undefined || correctAnswer === null) {
        return { error: 'Error saving user answers', statusCode: 500, message: 'idQuestion in database is null or undefined' }
      }
      // const isCorrect = userAnswer === correctAnswer
      // const idQuestionDb = correctAnswer ? correctAnswer[1] : null
      const correctStatus = this.evaluateAnswer(correctAnswer, userAnswer)
      LOG.debug(`user answer is ${userAnswer}, and the id in db is ${idQuestionDb}correct answer is ${correctAnswer} and the status is: ${correctStatus}`)

      let answerSaved = null
      try {
        answerSaved = await this.saveDataQuestionAnswer(typeUser, idUser, idEvaluation, idQuestionDb, correctStatus, userAnswer)
      } catch (error) {
        LOG.error(`error al guardar respuestas de usuario: ${error.message}`)
        return { error: 'Error saving user answers', statusCode: 500, message: 'Las respuestas que ingreso el usuario no se pudieron almacenar.' }
      }
      const evaluation = {
        id_resultado_evaluaciones: answerSaved.id_resultado_evaluaciones,
        id_pregunta: idQuestionDb,
        clue,
        answer: correctAnswer,
        num_pregunta: position,
        correcta: correctStatus,
        oracion_usuario: userAnswer,
        orientation,
        startx,
        starty
      }
      this.resultCrossWordEvaluations.push(evaluation)
    }
    LOG.debug(`the results are ${this.resultCrossWordEvaluations}`)
    return this.resultCrossWordEvaluations.sort((a, b) => a.position - b.position)
  }

  convertObjectToMap (obj) {
    return new Map(Object.entries(obj))
  }

  async statusWordSearchAnswer (answersUser, typeUser, idUser, activityInfo, idEvaluation) {
    LOG.info('Entrando al servicio status crossWord answer')
    this.resultCrossWordEvaluations = []

    // recorrer respuestas correcta
    const correctAnswersMap = new Map()
    for (const word of activityInfo.resultWordSearchEvaluation) {
      const idQuestionDb = word.idPreguntaDb
      const numPregunta = word.numPregunta
      const palabra = word.palabra
      LOG.debug(`the word id ${palabra}, the id question in db is ${idQuestionDb} and the numQuestion is ${numPregunta}`)
      correctAnswersMap.set(numPregunta, [palabra, idQuestionDb])
    }
    const userAnswersMap = new Map()
    for (const answerUser of answersUser) {
      const numPregunta = answerUser.numPregunta
      const palabra = answerUser.palabra
      LOG.debug(`the correct word is ${palabra}, and the numQuestion is ${numPregunta}`)
      userAnswersMap.set(numPregunta, palabra)
    }
    // Comparar los mapas
    const results = []
    for (const [numPregunta, correctEntry] of correctAnswersMap) {
      const [correctWord, idQuestionDb] = correctEntry
      const userWord = userAnswersMap.get(numPregunta)
      if (!userWord) {
        return { error: 'Error saving user answers', statusCode: 500, message: 'Las respuestas que ingreso el usuario no se pudieron almacenar.' }
      }

      const isCorrect = this.evaluateAnswer(correctWord, userWord)
      results.push({
        numPregunta,
        userWord,
        correctWord,
        idQuestionDb,
        isCorrect
      })
      try {
        const answerSaved = await this.saveDataQuestionAnswer(typeUser, idUser, idEvaluation, idQuestionDb, isCorrect, userWord)
        LOG.info(`the answer: ${answerSaved} has been saved correctly`)
      } catch (error) {
        LOG.error(`error al guardar respuestas de usuario: ${error.message}`)
        return { error: 'Error saving user answers', statusCode: 500, message: 'Las respuestas que ingreso el usuario no se pudieron almacenar.' }
      }
    }
    return 'Respuestas guardadas correctamente'
  }

  async statusMultipleChoiceAnswer (answersUser, typeUser, idUser, activityInfo, idEvaluation) {
    LOG.info('Entrando al servicio status multiple choice answer')
    this.resultMultipleChoiceEvaluations = []

    // recorrer respuestas usuarios
    for (const answerUser of answersUser) {
      const idQuestionDb = answerUser.idQuestionDb
      const numPregunta = answerUser.idPregunta
      for (const answer of answerUser.respuestaSeleccionada) {
        const idOption = answer.idOpcion
        const text = answer.texto
        const status = answer.correcta
        const idAnswerDb = answer.idRespuestaDb
        LOG.debug(`the option select is ${idOption}, the id question in db is ${idQuestionDb} and the numQuestion is ${numPregunta} the selected option say: ${text} and the status is ${status}`)
        try {
          const answerSaved = await this.saveDataMultipleChoice(typeUser, idUser, idEvaluation, idQuestionDb, status, text, idAnswerDb)
          LOG.info(`the answer: ${answerSaved} has been saved succesfull`)
          const evaluation = {
            id_resultado_evaluaciones: answerSaved.id_resultado_evaluaciones,
            id_pregunta: idQuestionDb,
            num_pregunta: numPregunta,
            answer: text,
            correcta: status,
            idOpcion: idOption,
            idRespuestaDb: idAnswerDb
          }
          this.resultMultipleChoiceEvaluations.push(evaluation)
        } catch (error) {
          LOG.error(`error al guardar respuestas de usuario: ${error.message}`)
          return { error: 'Error saving user answers', statusCode: 500, message: 'Las respuestas que ingreso el usuario no se pudieron almacenar.' }
        }
      }
    }
    return this.resultMultipleChoiceEvaluations.sort((a, b) => a.num_pregunta - b.num_pregunta)
    // const userAnswersMap = new Map()
    // for (const answerUser of answersUser) {
    //   const numPregunta = answerUser.numPregunta
    //   const palabra = answerUser.palabra
    //   LOG.debug(`the correct word is ${palabra}, and the numQuestion is ${numPregunta}`)
    //   userAnswersMap.set(numPregunta, palabra)
    // }
    // // Comparar los mapas
    // const results = []
    // for (const [numPregunta, correctEntry] of correctAnswersMap) {
    //   const [correctWord, idQuestionDb] = correctEntry
    //   const userWord = userAnswersMap.get(numPregunta)
    //   if (!userWord) {
    //     return { error: 'Error saving user answers', statusCode: 500, message: 'Las respuestas que ingreso el usuario no se pudieron almacenar.' }
    //   }

    //   const isCorrect = this.evaluateAnswer(correctWord, userWord)
    //   results.push({
    //     numPregunta,
    //     userWord,
    //     correctWord,
    //     idQuestionDb,
    //     isCorrect
    //   })

    // }
  }
}

module.exports = new AnswerEvaluationService()
