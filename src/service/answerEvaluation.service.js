const resultEvaluations = require('../model/schema/evaluation.results.schema')
const scoreUsers = require('../model/schema/score.schema')
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
    const countTotalQuetions = 0
    let countCorrectAnswers = 0
    for (const key of Object.keys(answersUser)) {
      const question = answersUser[key]
      arrayUserAnswer = question.answer
      const numQuestion = question.numPregunta
      LOG.debug(`Question Number: ${numQuestion} total question at the moment: ${countTotalQuetions + 1}`)
      LOG.debug(`Answers: ${arrayUserAnswer}`)
      // llamamos a un servicio para que nos diga si esta en orden el array
      statusAnswer = this.isArrayOrder(arrayUserAnswer)
      const arraySaved = JSON.stringify(arrayUserAnswer)
      if (statusAnswer) {
        countCorrectAnswers = countCorrectAnswers + 1
      }
      const reportAnswer = await this.addScoreUser(typeUser, idUser, idEvaluation, countCorrectAnswers, numQuestion)
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
        num_pregunta: numQuestion, // este actualizara mi numero total de preguntas en mi tabla
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

  async statusAnswer (activityInfo, answersUser, typeUser, idUser, idEvaluation) {
    LOG.info(`status answer devuelve ${this.resultEvaluations}`)
    // debo guardar en resultados_evaluaciones cada respuesta
    LOG.info('Entrando al servicio status answer')
    this.resultEvaluations = []
    let countTotalQuetions = 0
    let countCorrectAnswers = 0
    // iterando sobre las respuestas correctas
    for (const activity of activityInfo) {
      // const { idOrdenamiento, oracion, idEvaluacion, numPregunta, orden } = activity
      countTotalQuetions = countTotalQuetions + 1
      const idOrdenamiento = activity.id_ordenamiento
      const oracion = activity.oracion
      const idEvaluacion = activity.id_evaluacion
      const numPregunta = activity.num_pregunta
      LOG.debug(`numquestion: ${numPregunta} and counter is equal: ${countTotalQuetions}`)
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
      if (correctaEstatus) {
        countCorrectAnswers = countCorrectAnswers + 1
      }
      const reportAnswer = await this.addScoreUser(typeUser, idUser, idEvaluation, countCorrectAnswers, numPregunta)
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
    let countTotalQuestion = 0
    for (const activity of activityInfo.resultWordSearchEvaluation) {
      const idQuestionDb = activity.idQuestionDb
      const position = activity.position
      const clue = activity.clue
      const answer = activity.answers[0].answer // Asumiendo que siempre hay una respuesta en el array answers
      const orientation = activity.answers[0].orientation
      const startx = activity.answers[0].startX
      const starty = activity.answers[0].startY
      countTotalQuestion = countTotalQuestion + 1
      LOG.debug(`Question Number correct: ${position}`)
      LOG.debug(`correct answers: ${answer} and id db is ${idQuestionDb}`)
      correctAnswersMap.set(position, [answer, idQuestionDb, clue, orientation, startx, starty])
    }
    LOG.info(`Number total of questions are ${countTotalQuestion}`)
    let countCorrectAnswers = 0
    for (const [position, userAnswer] of userAnswersMap) {
      const [correctAnswer, idQuestionDb, clue, orientation, startx, starty] = correctAnswersMap.get(position)

      if (correctAnswer === undefined || correctAnswer === null) {
        return { error: 'Error saving user answers', statusCode: 500, message: 'idQuestion in database is null or undefined' }
      }
      // const isCorrect = userAnswer === correctAnswer
      // const idQuestionDb = correctAnswer ? correctAnswer[1] : null
      const correctStatus = this.evaluateAnswer(correctAnswer, userAnswer)
      if (correctStatus) {
        countCorrectAnswers = countCorrectAnswers + 1
      }
      const reportAnswer = await this.addScoreUser(typeUser, idUser, idEvaluation, countCorrectAnswers, countTotalQuestion)
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
    let countTotalQuestion = 0
    for (const word of activityInfo.resultWordSearchEvaluation) {
      const idQuestionDb = word.idPreguntaDb
      const numPregunta = word.numPregunta
      const palabra = word.palabra
      countTotalQuestion = countTotalQuestion + 1
      LOG.debug(`the word id ${palabra}, the id question in db is ${idQuestionDb} and the numQuestion is ${numPregunta}`)
      correctAnswersMap.set(numPregunta, [palabra, idQuestionDb])
    }
    const userAnswersMap = new Map()
    for (const answerUser of answersUser) {
      const numPregunta = answerUser.numPregunta
      const palabra = answerUser.palabra
      LOG.debug(`the user word is ${palabra}, and the numQuestion is ${numPregunta}`)
      userAnswersMap.set(numPregunta, palabra)
    }
    LOG.info(`Total questions: ${countTotalQuestion}`)
    // Comparar los mapas
    const results = []
    let countCorrectAnswers = 0
    for (const [numPregunta, userWord] of userAnswersMap) {
      const correctEntry = correctAnswersMap.get(numPregunta)
      const [correctWord, idQuestionDb] = correctEntry
      if (!userWord) {
        return { error: 'Error saving user answers', statusCode: 500, message: 'Las respuestas que ingreso el usuario no se pudieron almacenar.' }
      }

      const isCorrect = this.evaluateAnswer(correctWord, userWord)
      if (isCorrect) {
        countCorrectAnswers = countCorrectAnswers + 1
      }
      const reportAnswer = await this.addScoreUser(typeUser, idUser, idEvaluation, countCorrectAnswers, countTotalQuestion)
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

  async addScoreUser (typeUser, idUser, idEvaluation, corrects, totalQuestions) {
    let transaction
    try {
      transaction = await sequelize.transaction()
      LOG.info(`la información a guardar es tipo usuario: ${typeUser}, id usuario: ${idUser}, id evaluación: ${idEvaluation} correctas: ${corrects} total preguntas ${totalQuestions}`)
      let existingAnswer, created
      switch (typeUser) {
        case 'REGISTER':
          LOG.info('register user');
          [existingAnswer, created] = await scoreUsers.findOrCreate({
            where: {
              id_usuario_registrado: idUser,
              id_evaluacion: idEvaluation
            },
            defaults: {
              id_usuario_registrado: idUser,
              id_evaluacion: idEvaluation,
              correcta: corrects,
              total_pregunta: totalQuestions
            },
            transaction
          })
          if (!created) {
            LOG.info('opción de respuesta previamente creada, se actualizó')
            existingAnswer.correcta = corrects
            existingAnswer.total_pregunta = totalQuestions
            await existingAnswer.save({ transaction })
          }
          break
        case 'GUEST':
          LOG.info('guest user');
          [existingAnswer, created] = await scoreUsers.findOrCreate({
            where: {
              id_usuario_invitado: idUser, // corregido a idGuestUser
              id_evaluacion: idEvaluation
            },
            defaults: {
              id_usuario_invitado: idUser, // corregido a idGuestUser
              id_evaluacion: idEvaluation,
              correcta: corrects,
              total_pregunta: totalQuestions
            },
            transaction
          })
          if (!created) {
            LOG.info('opción de respuesta previamente creada, se actualizó')
            existingAnswer.correcta = corrects
            existingAnswer.total_pregunta = totalQuestions
            await existingAnswer.save({ transaction })
          }
          break
        default:
          LOG.error('error al guardar respuestas en tabla calificacion de usuario: ')
          return { error: 'Error saving user answers', statusCode: 500, message: 'La calificacion del usuario no se pudo almacenar.' }
      }

      await transaction.commit()
      return { answer: existingAnswer }
    } catch (error) {
      LOG.error(`Ocurrió un error al agregar la opción de respuesta a la evaluación, error: ${error}`)
      if (transaction) await transaction.rollback()
      LOG.error(`error al guardar respuestas respuestas en tabla calificacion de usuario ${error.message}`)
      return { error: 'Error saving user answers', statusCode: 500, message: 'La calificacion del usuario no se pudo almacenar.' }
    }
  }

  async statusMultipleChoiceAnswer (answersUser, typeUser, idUser, activityInfo, idEvaluation) {
    LOG.info('Entrando al servicio status multiple choice answer')
    this.resultMultipleChoiceEvaluations = []

    // recorrer respuestas usuarios
    // esto es para crear un mapa el cual despues voy a recorrer sobre activity info para saber cuantas
    // respuestas correctas tiene cada pregunta e ir armando el promedio
    // const answerReport = [idQuestionDb, { idOption, status }]
    const answerActivity = new Map()
    let totalQuestions = 0
    for (const activity of activityInfo) {
      const idQuestionDb = activity.idQuestionDb
      const numPregunta = activity.idPregunta
      for (const answer of activity.respuestas) {
        const idOption = answer.idOpcion
        const status = answer.correcta
        const idAnswerDb = answer.idRespuestaDb
        if (status) {
          answerActivity.set(idAnswerDb, { idQuestionDb, numPregunta, idOption, status })
        }
      }
      totalQuestions = numPregunta
    }
    LOG.info(`The evaluation ${idEvaluation} have ${totalQuestions} questions`)
    const answerReport = new Map()
    let countTotalQuetions = 0
    let countCorrectAnswers = 0
    for (const answerUser of answersUser) {
      countTotalQuetions = countTotalQuetions + 1
      const idQuestionDb = answerUser.idQuestionDb
      const numPregunta = answerUser.idPregunta
      for (const answer of answerUser.respuestaSeleccionada) {
        const idOption = answer.idOpcion
        const text = answer.texto
        const status = answer.correcta
        const idAnswerDb = answer.idRespuestaDb
        if (status) {
          countCorrectAnswers = countCorrectAnswers + 1
        }
        const reportAnswer = await this.addScoreUser(typeUser, idUser, idEvaluation, countCorrectAnswers, totalQuestions)
        LOG.debug(`Total question is: ${totalQuestions} and the count of questions: ${countCorrectAnswers}`)
        answerReport.set(idAnswerDb, { idQuestionDb, numPregunta, idOption, status })
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
          // LOG.debug(`Report correct answers: ${reportAnswer.answer.existingAnswer.correcta}`)
          this.resultMultipleChoiceEvaluations.push(evaluation)
        } catch (error) {
          LOG.error(`error al guardar respuestas de usuario: ${error.message}`)
          return { error: 'Error saving user answers', statusCode: 500, message: 'Las respuestas que ingreso el usuario no se pudieron almacenar.' }
        }
      }
    }

    // Inicializar un mapa para los resultados
    /* const results = new Map()

    // Contar respuestas correctas por pregunta
    answerActivity.forEach((value) => {
      const { numPregunta } = value
      if (!results.has(numPregunta)) {
        results.set(numPregunta, { totalCorrect: 0, userCorrect: 0 })
      }
      const result = results.get(numPregunta)
      result.totalCorrect += 1
    })

    // Contar respuestas correctas del usuario por pregunta
    answerReport.forEach((value, key) => {
      const { numPregunta, idOption } = value
      if (answerActivity.has(key) && answerActivity.get(key).status) {
        const result = results.get(numPregunta)
        result.userCorrect += 1
      }
    })

    // Mostrar los resultados
    results.forEach((value, key) => {
      LOG.info(`Pregunta ${key}: ${value.userCorrect}/${value.totalCorrect} respuestas correctas`)
    }) */

    return this.resultMultipleChoiceEvaluations.sort((a, b) => a.num_pregunta - b.num_pregunta)
  }
}

module.exports = new AnswerEvaluationService()
