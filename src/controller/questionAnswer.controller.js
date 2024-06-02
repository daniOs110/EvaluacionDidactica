const questionAnswerRouter = require('express').Router()
const LOG = require('../app/logger')
const authMiddleware = require('../middleware/session')
// const { validateAddLetter } = require('../validators/users.validator')
// const { matchedData } = require('express-validator')
// const AddLetterDTO = require('../dtos/dinamics/sort/addLetter.dto')
// const orderQuestionService = require('../service/dinamics/sorter/orderQuestion.service')
const questionAnswerService = require('../service/dinamics/questionAnswer/questionAnswer.service')
const createEvaluationService = require('../service/createEvaluation.service')

questionAnswerRouter.post('/dinamic/crossword/add', authMiddleware, async (req, res) => {
  const idEvaluation = req.body.idEvaluacion
  const gridCols = req.body.gridCols
  const gridRows = req.body.gridRows
  const data = req.body.answers
  const saveQuestions = []
  const saveAnswers = []
  let saveQuestion = null
  let saveAnswer = null

  try {
    const boardData = await questionAnswerService.saveGrid(idEvaluation, gridCols, gridRows)
    for (const crossword of data) {
      const answer = crossword.answer
      const clue = crossword.clue
      const orientation = crossword.orientation
      const position = crossword.position
      const startX = crossword.startX
      const startY = crossword.startY
      // guardar pregunta y respuesta
      saveQuestion = await questionAnswerService.addQuestion(idEvaluation, clue, 1, position)
      saveQuestions.push(saveQuestion)
      if (saveQuestion && saveQuestion.question) {
        const idQuestion = saveQuestion.question.id_pregunta
        saveAnswer = await questionAnswerService.addBoardAnswers(idQuestion, answer, orientation, startX, startY)
        saveAnswers.push(saveAnswer)
      } else {
        return res.status(404).json({ message: `no se pudo guardar la pregunta ${position}.` })
      }
    }
    return res.status(201).json({ boardData, saveQuestions, saveAnswers })
  } catch (error) {
    LOG.error(`error al agregar la pregunta y respuesta al crucigrama: ${error.message}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

questionAnswerRouter.post('/dinamic/wordSearch/add', authMiddleware, async (req, res) => {
  const idEvaluation = req.body.idEvaluacion
  const gridCols = req.body.gridCols
  const gridRows = req.body.gridRows
  const data = req.body.palabras
  const saveWords = []
  let saveWord = null

  try {
    const boardData = await questionAnswerService.saveGrid(idEvaluation, gridCols, gridRows)
    for (const palabra of data) {
      const idWord = palabra.idPalabra
      const word = palabra.palabra
      saveWord = await questionAnswerService.addWord(idEvaluation, idWord, word)
      saveWords.push(saveWord)
    }
    return res.status(201).json({ boardData, saveWords })
  } catch (error) {
    LOG.error(`error al agregar las palabras a la sopa de letras: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

questionAnswerRouter.post('/dinamic/questionAnswer/add', authMiddleware, async (req, res) => {
  const idEvaluation = req.body.idEvaluacion
  const data = req.body.preguntas
  let saveQuestion = null
  let savedAnswer = null
  const saveQuestionArray = []
  const saveOptionAnswer = []
  try {
    for (const pregunta of data) {
      const idQuestion = pregunta.idPregunta
      const questionText = pregunta.pregunta
      const numAnswers = pregunta.numeroRespuestas
      const answers = pregunta.respuestas
      LOG.info(`${idQuestion}.- ${questionText} it allows ${numAnswers} option answers`)
      // guardarla en la tabla preguntas
      saveQuestion = await questionAnswerService.addQuestion(idEvaluation, questionText, numAnswers, idQuestion)
      saveQuestionArray.push(saveQuestion)
      if (saveQuestion && saveQuestion.question) {
        LOG.info('Question save succesfull')
        for (const answer of answers) {
          const idQuestionSaved = saveQuestion.question.id_pregunta
          const idOption = answer.hasOwnProperty('idOpcion') ? answer.idOpcion : 0
          const textAnswer = answer.hasOwnProperty('texto') ? answer.texto : ''
          const status = answer.hasOwnProperty('status') ? answer.status : false
          // guardar respuesta
          LOG.info(`Saving option anser ${idOption}`)
          savedAnswer = await questionAnswerService.addOptionAnswers(idQuestionSaved, textAnswer, status, idOption)
          saveOptionAnswer.push(savedAnswer)
        }
      } else {
        return res.status(404).json({ message: `no se pudo guardar la pregunta ${idQuestion}.` })
      }
    }

    return res.status(201).json({ saveQuestionArray, saveOptionAnswer })
  } catch (error) {
    LOG.error(`error al agregar la pregunta y respuestas asociadas: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

questionAnswerRouter.get('/dinamic/questionAnswer/getActivity/:idEvaluacion', authMiddleware, async (req, res) => {
  // const user = req.user
  const idActivity = req.params.idEvaluacion
  try {
    LOG.info(`el id de evaluación es ${idActivity}`)
    // datos de la evaluacion
    const evaluationsInfo = await createEvaluationService.findEvaluationById(idActivity)
    if (evaluationsInfo === null) {
      return res.status(404).json({ message: 'No se encontraron evaluaciones asociadas al id de evaluación' })
    }

    // llamar al metodo que devuelva la evaluacion que coincida con el id
    const activityInfo = await questionAnswerService.getQuestionAnswerEvaluation(idActivity)
    if (activityInfo === null) {
      return res.status(404).json({ error: 'No hay actividades asociadas a la evaluación' })
    }
    return res.status(200).json({ infoEvaluation: evaluationsInfo, activityInfo })
  } catch (error) {
    LOG.error(`error al traer la actividad: ${error}`)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
questionAnswerRouter.get('/dinamic/crossword/getActivity/:idEvaluacion', authMiddleware, async (req, res) => {
  // const user = req.user
  const idActivity = req.params.idEvaluacion
  try {
    LOG.info(`el id de evaluación es ${idActivity}`)
    // info de evaluación
    const evaluationsInfo = await createEvaluationService.findEvaluationById(idActivity)
    if (evaluationsInfo === null) {
      return res.status(404).json({ message: 'No se encontraron evaluaciones asociadas al id de evaluación' })
    }
    const boardData = await questionAnswerService.getBoardData(idActivity)
    if (boardData.error) {
      // Si se encontró un error, se devuelve el código de estado correspondiente
      return res.status(boardData.statusCode).json({ error: boardData.error, message: boardData.message })
    }
    // llamar al metodo que devuelva la evaluacion que coincida con el id
    const activityInfo = await questionAnswerService.getCrosswordEvaluation(idActivity)
    if (activityInfo === null) {
      return res.status(404).json({ error: 'No hay actividades asociadas a la evaluación' })
    }
    return res.status(200).json({ infoEvaluation: evaluationsInfo, activityInfo })
  } catch (error) {
    LOG.error(`error al traer la actividad: ${error}`)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
questionAnswerRouter.get('/dinamic/wordSearch/getActivity/:idEvaluacion', authMiddleware, async (req, res) => {
  // const user = req.user
  const idActivity = req.params.idEvaluacion
  try {
    LOG.info(`el id de evaluación es ${idActivity}`)
    // info de evaluación
    const evaluationsInfo = await createEvaluationService.findEvaluationById(idActivity)
    if (evaluationsInfo === null) {
      return res.status(404).json({ message: 'No se encontraron evaluaciones asociadas al id de evaluación' })
    }
    const boardData = await questionAnswerService.getBoardData(idActivity)
    if (boardData.error) {
      // Si se encontró un error, se devuelve el código de estado correspondiente
      return res.status(boardData.statusCode).json({ error: boardData.error, message: boardData.message })
    }
    // llamar al metodo que devuelva la evaluacion que coincida con el id
    const activityInfo = await questionAnswerService.getWordSearchEvaluation(idActivity)
    if (activityInfo.error) {
      // Si se encontró un error, se devuelve el código de estado correspondiente
      return res.status(activityInfo.statusCode).json({ error: activityInfo.error, message: activityInfo.message })
    }
    if (activityInfo === null) {
      return res.status(404).json({ error: 'No hay actividades asociadas a la evaluación' })
    }
    return res.status(200).json({ infoEvaluation: evaluationsInfo, activityInfo })
  } catch (error) {
    LOG.error(`error al traer la actividad: ${error}`)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

questionAnswerRouter.post('/dinamic/deleteQuestion', authMiddleware, async (req, res) => {
  const idEvaluation = req.body.idEvaluacion
  const numQuestion = req.body.numPregunta
  try {
    // se va a recibir la oracion y se guardara en bd
    LOG.info(`la información recibida es idEvaluacion: ${idEvaluation} y numero de pregunta ${numQuestion}`)
    const deleteQuestion = await questionAnswerService.deleteQuestion(idEvaluation, numQuestion)

    if (deleteQuestion.error) {
      // Si se encontró un error, se devuelve el código de estado correspondiente
      return res.status(deleteQuestion.statusCode).json({ error: deleteQuestion.error, message: deleteQuestion.message })
    }
    return res.status(201).json(deleteQuestion)
  } catch (error) {
    LOG.error(`error al agregar la oración: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

questionAnswerRouter.post('/dinamic/delete/answer', authMiddleware, async (req, res) => {
  const idEvaluation = req.body.idEvaluacion
  const numQuestion = req.body.numPregunta
  const idOption = req.body.idOpcion
  try {
    // se va a recibir la oracion y se guardara en bd
    LOG.info(`la información recibida es idEvaluacion: ${idEvaluation} y numero de pregunta ${numQuestion}`)
    const deleteQuestion = await questionAnswerService.deleteAnswer(idEvaluation, numQuestion, idOption)

    if (deleteQuestion.error) {
      // Si se encontró un error, se devuelve el código de estado correspondiente
      return res.status(deleteQuestion.statusCode).json({ error: deleteQuestion.error, message: deleteQuestion.message })
    }
    return res.status(201).json(deleteQuestion)
  } catch (error) {
    LOG.error(`error al borrar la opcion de respuesta: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})
questionAnswerRouter.post('/dinamic/delete/answerCrossWord', authMiddleware, async (req, res) => {
  const idEvaluation = req.body.idEvaluacion
  const numQuestion = req.body.numPregunta
  try {
    // se va a recibir la oracion y se guardara en bd
    LOG.info(`la información recibida es idEvaluacion: ${idEvaluation} y numero de pregunta ${numQuestion}`)
    const deleteQuestion = await questionAnswerService.deleteAnswerCrossword(idEvaluation, numQuestion)

    if (deleteQuestion.error) {
      // Si se encontró un error, se devuelve el código de estado correspondiente
      return res.status(deleteQuestion.statusCode).json({ error: deleteQuestion.error, message: deleteQuestion.message })
    }
    return res.status(201).json(deleteQuestion)
  } catch (error) {
    LOG.error(`error al borrar la opcion de respues crucigrama: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = questionAnswerRouter
