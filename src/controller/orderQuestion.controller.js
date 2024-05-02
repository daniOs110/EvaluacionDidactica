const orderQuestionRouter = require('express').Router()
// const createEvaluationService = require('../service/createEvaluation.service')
const LOG = require('../app/logger')
// const { verifyToken } = require('../helpers/handlerJwt')
// const ErrorMessages = require('../utils/errorMessages')
// const SuccesfullMessages = require('../utils/succesfullMessages')
const authMiddleware = require('../middleware/session')
const { validateAddLetter } = require('../validators/users.validator')
// const { convertActivationData } = require('../middleware/activtionDate')
const { matchedData } = require('express-validator')
const AddLetterDTO = require('../dtos/dinamics/sort/addLetter.dto')
const orderQuestionService = require('../service/dinamics/sorter/orderQuestion.service')

orderQuestionRouter.post('/dinamic/orderQuestion/add', validateAddLetter, authMiddleware, async (req, res) => {
  const user = req.user
  try {
    // se va a recibir la oracion y se guardara en bd
    LOG.info(`la data traida es oracion: ${req.letter}, idEvalucion: ${req.idEvaluacion}, numPregunta: ${req.questionNumber}`)

    const validatedData = matchedData(req)
    const newLetterDTO = new AddLetterDTO(validatedData.letter, validatedData.idEvaluacion, validatedData.idDinamica, validatedData.questionNumber)
    const addLetter = await orderQuestionService.addLetter(newLetterDTO, user) // lamamos al servicio de crear evaluacion
    return res.status(201).json(addLetter)
  } catch (error) {
    LOG.error(`error al agregar la oración: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

orderQuestionRouter.get('/dinamic/orderQuestion/users/showSentence/:evaluationToken', async (req, res) => {
  // ya sabemos que usuario hizo la peticion
  const evaluationToken = req.params.evaluationToken

  try {
    const dataEvaluation = await orderQuestionService.getEvaluation(evaluationToken)
    if (dataEvaluation === null) {
      return res.status(404).json({ message: 'No se encontro evaluación' })
    }
    // const sentencesObject = Object.fromEntries(dataEvaluation)
    return res.status(200).json(dataEvaluation)
  } catch (error) {
    LOG.error(`error al mostrar datos de evaluacion: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = orderQuestionRouter
