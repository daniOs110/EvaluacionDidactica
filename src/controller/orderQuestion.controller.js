const orderQuestionRouter = require('express').Router()
const LOG = require('../app/logger')
// const { verifyToken } = require('../helpers/handlerJwt')
// const ErrorMessages = require('../utils/errorMessages')
// const SuccesfullMessages = require('../utils/succesfullMessages')
const authMiddleware = require('../middleware/session')
const { validateAddLetter } = require('../validators/users.validator')
const { matchedData } = require('express-validator')
const AddLetterDTO = require('../dtos/dinamics/sort/addLetter.dto')
const orderQuestionService = require('../service/dinamics/sorter/orderQuestion.service')
const { error } = require('winston')

orderQuestionRouter.post('/dinamic/orderQuestion/add', validateAddLetter, authMiddleware, async (req, res) => {
  const user = req.user
  try {
    // se va a recibir la oracion y se guardara en bd
    LOG.info(`la data traida es oracion: ${req.letter}, idEvalucion: ${req.idEvaluacion}, numPregunta: ${req.questionNumber}`)
    // no se si aquiu me serviria tener el tipio de dinamica (ordena los items, ordena el enunciado)
    const validatedData = matchedData(req)
    const newLetterDTO = new AddLetterDTO(validatedData.letter, validatedData.idEvaluacion, validatedData.idDinamica, validatedData.questionNumber)
    const addLetter = await orderQuestionService.addLetter(newLetterDTO, user) // lamamos al servicio de crear evaluacion
    return res.status(201).json(addLetter)
  } catch (error) {
    LOG.error(`error al agregar la oración: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

orderQuestionRouter.post('/dinamic/orderQuestion/delete', authMiddleware, async (req, res) => {
  try {
    // se va a recibir la oracion y se guardara en bd
    LOG.info(`la data traida es idOrdenamiento: ${req.body.idOrdenamieto}`)
    // no se si aquiu me serviria tener el tipio de dinamica (ordena los items, ordena el enunciado)
    const orderId = req.body.idOrdenamiento
    const deleteLetter = await orderQuestionService.deleteSentence(orderId) // lamamos al servicio de crear evaluacion
    if (deleteLetter == null) {
      return res.status(404).json({ message: 'La oración con el ID proporcionado no fue encontrada.' })
    }
    return res.status(201).json(deleteLetter)
  } catch (error) {
    LOG.error(`error al agregar la oración: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

orderQuestionRouter.get('/dinamic/orderQuestion/getActivity/:idEvaluacion', authMiddleware, async (req, res) => {
  // const user = req.user
  const idActivity = req.params.idEvaluacion
  try {
    LOG.info(`el id de evaluación es ${idActivity}`)
    // llamar al metodo que devuelva la evaluacion que coincida con el id
    const activityInfo = await orderQuestionService.getActivities(idActivity)
    if (activityInfo === null) {
      return res.status(404).json({ error: 'No hay actividades asociadas a la evaluación' })
    }
    return res.status(200).json(activityInfo)
  } catch (error) {
    LOG.error(`error al traer la actividad: ${error}`)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

orderQuestionRouter.post('/dinamic/orderItem/addItems', authMiddleware, async (req, res) => {
  const idEvaluation = req.body.idEvaluacion
  const dinamic = req.body.Dinamica
  const data = req.body.preguntas
  try {
    LOG.info(`La evaluacion tiene el id: ${idEvaluation}, y es una dinamica tipo: ${dinamic}`)
    // hacer un bucle que itere los enunciados que ingreso el usuario
    let activityData = null
    const responses = []
    for (const pregunta of data) {
      LOG.info(`pregunta: ${pregunta.idPregunta}, Descripción: ${pregunta.descripcion}`)
      for (const respuesta of pregunta.respuestas) {
        LOG.info(`id de ordenamiento: ${respuesta.id}, enunciado: ${respuesta.texto}`)
        // aqui va el sequelize que inserte los datos que necesitamos
        activityData = await orderQuestionService.addItems(pregunta.descripcion, idEvaluation, pregunta.idPregunta, respuesta.id, respuesta.texto)
        responses.push(activityData)
      }
    }
    LOG.info(`la respuesta es: ${responses}`)
    return res.status(200).json(responses)
  } catch (error) {
    LOG.error(`error al ingresar datos a la actividad: ${error}`)
    return res.status(500).json({ error: 'Internal server error' })
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

orderQuestionRouter.post('/dinamic/orderQuestion/users/checkAnswers/', async (req, res) => {

})

module.exports = orderQuestionRouter
