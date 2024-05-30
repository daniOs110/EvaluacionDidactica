const questionAnswerRouter = require('express').Router()
const LOG = require('../app/logger')
const authMiddleware = require('../middleware/session')
// const { validateAddLetter } = require('../validators/users.validator')
// const { matchedData } = require('express-validator')
// const AddLetterDTO = require('../dtos/dinamics/sort/addLetter.dto')
// const orderQuestionService = require('../service/dinamics/sorter/orderQuestion.service')
const questionAnswerService = require('../service/dinamics/questionAnswer/questionAnswer.service')

questionAnswerRouter.post('/dinamic/wordSearch/add', authMiddleware, async (req, res) => {
  const idEvaluation = req.body.idEvaluacion
  const gridCols = req.body.gridCols
  const gridRows = req.body.gridRows
  const data = req.body.palabras
  const saveWords = []
  let saveWord = null
  try {
    for (const palabra of data) {
      const idWord = palabra.idPalabra
      const word = palabra.palabra
      saveWord = await questionAnswerService.addWord(idEvaluation, idWord, word)
      saveWords.push(saveWord)
    }
    return res.status(201).json({ saveWords })
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

module.exports = questionAnswerRouter
