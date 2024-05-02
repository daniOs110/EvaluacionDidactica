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
    const newEvaluationDTO = new CreateEvaluationDTO(validatedData.title, validatedData.feedback, validatedData.activationDate, validatedData.activationTime, validatedData.duration, validatedData.idDinamic, validatedData.creationDate)
    // ir al service que guarde los datos ingresados en el req
    const createEvaluation = await createEvaluationService.createEvaluation(newEvaluationDTO, user)
    return res.status(201).json(createEvaluation)
  } catch (error) {
    LOG.error(`error al crear evaluacion: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = createEvaluationRouter
