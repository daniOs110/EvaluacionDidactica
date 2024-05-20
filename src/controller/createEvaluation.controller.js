const createEvaluationRouter = require('express').Router()
const createEvaluationService = require('../service/createEvaluation.service')
const LOG = require('../app/logger')
const authMiddleware = require('../middleware/session')
const authTypeUserMiddleware = require('../middleware/logged')
const { validateCreateEvaluation } = require('../validators/users.validator')
const { convertActivationData } = require('../middleware/activtionDate')
const { convertDeactivationData } = require('../middleware/deactivationDate')
const { matchedData } = require('express-validator')
const CreateEvaluationDTO = require('../dtos/createEvaluation/createEvaluation.dto')

createEvaluationRouter.post('/evaluation/create', authMiddleware, validateCreateEvaluation, convertActivationData, convertDeactivationData, async (req, res) => {
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

createEvaluationRouter.post('/evaluation/update/:idEvaluation', authMiddleware, validateCreateEvaluation, convertActivationData, convertDeactivationData, async (req, res) => {
  const user = req.user
  const idEvaluation = req.params.idEvaluation
  try {
    const validatedData = matchedData(req)
    // creo que la fecha ya esta en iso string
    const newEvaluationDTO = new CreateEvaluationDTO(validatedData.title, validatedData.subtitle, validatedData.description, validatedData.feedback, validatedData.activationDate, validatedData.activationTime, validatedData.duration, validatedData.idDinamic, validatedData.deactivationDate, validatedData.deactivationTime)
    // ir al service que guarde los datos ingresados en el req
    const updateEvaluation = await createEvaluationService.updateEvaluation(newEvaluationDTO, user, idEvaluation)
    if (updateEvaluation.error) {
      // Si se encontró un error, se devuelve el código de estado correspondiente
      return res.status(updateEvaluation.statusCode).json({ error: updateEvaluation.error, message: updateEvaluation.message })
    }

    return res.status(201).json(updateEvaluation)
  } catch (error) {
    LOG.error(`error al crear evaluacion: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

createEvaluationRouter.delete('/evaluation/delete/:idEvaluation', authMiddleware, async (req, res) => {
  const user = req.user
  const idEvaluation = req.params.idEvaluation
  try {
    const userId = user.get('id_info_usuario')
    const deleteEvaluation = await createEvaluationService.deleteEvaluation(idEvaluation, userId)

    if (deleteEvaluation.error) {
      // Si se encontró un error, se devuelve el código de estado correspondiente
      return res.status(deleteEvaluation.statusCode).json({ error: deleteEvaluation.error, message: deleteEvaluation.message })
    }
    return res.status(201).json(deleteEvaluation)
  } catch (error) {
    LOG.error(`error al borrar la evaluacion: ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

createEvaluationRouter.get('/evaluation/getDinamics', authTypeUserMiddleware, async (req, res) => {
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

createEvaluationRouter.get('/evaluation/getEvaluation/:idEvaluacion', authMiddleware, async (req, res) => {
  const idEvaluacion = req.params.idEvaluacion
  try {
    const evaluationsInfo = await createEvaluationService.findEvaluationById(idEvaluacion)
    if (evaluationsInfo === null) {
      return res.status(404).json({ message: 'No se encontraron evaluaciones asociadas al id de evaluación' })
    }
    return res.status(200).json(evaluationsInfo)
  } catch (error) {
    LOG.error(`error al traer la informacion de la tabla evaluaciones : ${error}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = createEvaluationRouter
