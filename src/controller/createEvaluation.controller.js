const createEvaluationRouter = require('express').Router()
const createEvaluationService = require('../service/createEvaluation.service')
const LOG = require('../app/logger')
// const { verifyToken } = require('../helpers/handlerJwt')
// const ErrorMessages = require('../utils/errorMessages')
// const SuccesfullMessages = require('../utils/succesfullMessages')
const authMiddleware = require('../middleware/session')
const { validateCreateEvaluation } = require('../validators/users.validator')
const { convertActivationData } = require('../middleware/activtionDate')
const { matchedData } = require('express-validator')
const CreateEvaluationDTO = require('../dtos/createEvaluation/createEvaluation.dto')

createEvaluationRouter.post('/evaluation/create', authMiddleware, validateCreateEvaluation, convertActivationData, async (req, res) => {
  const user = req.user
  try {
    const validatedData = matchedData(req)
    // creo que la fecha ya esta en iso string
    const newEvaluationDTO = new CreateEvaluationDTO(validatedData.title, validatedData.subtitle, validatedData.description, validatedData.feedback, validatedData.activationDate, validatedData.activationTime, validatedData.duration, validatedData.idDinamic, validatedData.deactivationDate, validatedData.deactivationTime)
    // ir al service que guarde los datos ingresados en el req
    const createEvaluation = await createEvaluationService.createEvaluation(newEvaluationDTO, user)
    return res.status(201).json(createEvaluation)
  } catch (error) {
    LOG.error(`error al crear evaluacion: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

createEvaluationRouter.get('/evaluation/getDinamics', authMiddleware, async (req, res) => {
  try {
    const dinamicInfo = await createEvaluationService.getCombinedInfo()
    if (dinamicInfo === null) {
      return res.status(404).json({ message: 'No se encontro información' })
    }
    return res.status(200).json(dinamicInfo)
  } catch (error) {
    LOG.error(`error al traer la informacion de dinamicas: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

createEvaluationRouter.get('/evaluation/getClasification', authMiddleware, async (req, res) => {
  try {
    const clasificationInfo = await createEvaluationService.getClasificationInfo()
    if (clasificationInfo === null) {
      return res.status(404).json({ message: 'No se encontro información' })
    }
    return res.status(200).json(clasificationInfo)
  } catch (error) {
    LOG.error(`error al traer la informacion de clasificación : ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

createEvaluationRouter.get('/evaluation/getAllEvaluations', authMiddleware, async (req, res) => {
  const user = req.user
  try {
    const evaluationsInfo = await createEvaluationService.findAllEvaluations(user)
    if (evaluationsInfo === null) {
      return res.status(404).json({ message: 'No se encontraron evaluaciones asociadas al usuario' })
    }
    return res.status(200).json(evaluationsInfo)
  } catch (error) {
    LOG.error(`error al traer la informacion de la tabla evaluaciones : ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})
module.exports = createEvaluationRouter
