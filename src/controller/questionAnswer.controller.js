const questionAnswerRouter = require('express').Router()
const LOG = require('../app/logger')
const authMiddleware = require('../middleware/session')
// const { validateAddLetter } = require('../validators/users.validator')
// const { matchedData } = require('express-validator')
// const AddLetterDTO = require('../dtos/dinamics/sort/addLetter.dto')
// const orderQuestionService = require('../service/dinamics/sorter/orderQuestion.service')
const questionAnswerService = require('../service/dinamics/questionAnswer/questionAnswer.service')

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

questionAnswerRouter.get('/dinamic/getActivity/questionAnswer/:idEvaluacion', authMiddleware, async (req, res) => {
  // const user = req.user
  const idActivity = req.params.idEvaluacion
  try {
    LOG.info(`el id de evaluación es ${idActivity}`)
    // llamar al metodo que devuelva la evaluacion que coincida con el id
    const activityInfo = await questionAnswerService.getQuestionAnswerEvaluation(idActivity)
    if (activityInfo === null) {
      return res.status(404).json({ error: 'No hay actividades asociadas a la evaluación' })
    }
    return res.status(200).json(activityInfo)
  } catch (error) {
    LOG.error(`error al traer la actividad: ${error}`)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
questionAnswerRouter.get('/dinamic/getActivity/crossword/:idEvaluacion', authMiddleware, async (req, res) => {
  // const user = req.user
  const idActivity = req.params.idEvaluacion
  try {
    LOG.info(`el id de evaluación es ${idActivity}`)
    // llamar al metodo que devuelva la evaluacion que coincida con el id
    const activityInfo = await questionAnswerService.getCrosswordEvaluation(idActivity)
    if (activityInfo === null) {
      return res.status(404).json({ error: 'No hay actividades asociadas a la evaluación' })
    }
    return res.status(200).json(activityInfo)
  } catch (error) {
    LOG.error(`error al traer la actividad: ${error}`)
    return res.status(500).json({ error: 'Internal server error' })
  }
})
questionAnswerRouter.get('/dinamic/getActivity/wordSearch/:idEvaluacion', authMiddleware, async (req, res) => {
  // const user = req.user
  const idActivity = req.params.idEvaluacion
  try {
    LOG.info(`el id de evaluación es ${idActivity}`)
    // llamar al metodo que devuelva la evaluacion que coincida con el id
    const activityInfo = await questionAnswerService.getWordSearchEvaluation(idActivity)
    if (activityInfo === null) {
      return res.status(404).json({ error: 'No hay actividades asociadas a la evaluación' })
    }
    return res.status(200).json(activityInfo)
  } catch (error) {
    LOG.error(`error al traer la actividad: ${error}`)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = questionAnswerRouter
