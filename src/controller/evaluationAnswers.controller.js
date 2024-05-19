const evaluationAnswerRouter = require('express').Router()
const LOG = require('../app/logger')
const authTypeUserMiddleware = require('../middleware/logged')
const AnswerEvaluationService = require('../service/answerEvaluation.service')

const createEvaluationService = require('../service/createEvaluation.service')
const orderQuestionService = require('../service/dinamics/sorter/orderQuestion.service')

evaluationAnswerRouter.post('/answer/sortSentence', authTypeUserMiddleware, async (req, res) => {
  const user = req.user
  const typeUser = req.type
  const idEvaluation = parseInt(req.body.idEvaluacion, 10)
  const answersUser = req.body.sentence // falta meterle una validacion a estos datos (mientras se quedara asi)
  LOG.info(`El tipo de dato answer user es: ${typeof answersUser}`)
  /**
   * idEvaluacion
   * idPreguntaOrdenamiento (numPregunta/oracion) VIENE en el mapa
   * idUsuarioInvitado/idUsuarioRegistrado (lo saco del token)
   */
  let idUser = null
  // LOG.info(`the type of user is ${typeUser} and the user is ${user}`)
  // debo saber que id de evaluacion estan contestando
  switch (typeUser) {
    case 'REGISTER':
      LOG.info(`The user is ${typeUser}`)
      idUser = user.get('id_info_usuario')
      break
    case ('GUEST'):
      LOG.info(`The user is ${typeUser}`)
      idUser = user.get('id_usuarios_invitados')
      break
    default:
      LOG.error(`Type of user not recognized ${typeUser}`)
      return res.status(404).json({ message: 'Usuario no reconocido' })
  }
  LOG.info(`The user type is ${typeUser} and the id: ${idUser}`)
  try {
    // verificar que no se haya respondido antes la evaluacion por el mismo usuario
    const evaluationAnswered = await AnswerEvaluationService.alreadyAnswered(idEvaluation, idUser, typeUser)
    if (evaluationAnswered.error) {
      // Si se encontró un error, se devuelve el código de estado correspondiente
      return res.status(evaluationAnswered.statusCode).json({ error: evaluationAnswered.error, message: evaluationAnswered.message })
    }
    LOG.info(`Service alreadyAnswered say ${evaluationAnswered}`)
    // ahora debo saber las respuestas correctas asociadas a la evaluación y las que el usuario contesto
    const evaluationsInfo = await createEvaluationService.findEvaluationById(idEvaluation)
    if (evaluationsInfo === null) {
      return res.status(404).json({ message: 'No se encontraron evaluaciones asociadas al id de evaluación' })
    }
    // servicio para saber que oraciones escribio el profesor
    const activityInfo = await orderQuestionService.getActivities(idEvaluation)
    if (activityInfo === null) {
      return res.status(404).json({ error: 'No hay actividades asociadas a la evaluación' })
    }
    // servicio para saber que oraciones contesto el usuario
    const statusAswers = await AnswerEvaluationService.statusAnswer(activityInfo, answersUser, typeUser, idUser)
    if (statusAswers.error) {
    // Si se encontró un error, se devuelve el código de estado correspondiente
      return res.status(statusAswers.statusCode).json({ error: statusAswers.error, message: statusAswers.message })
    }
    return res.status(200).json({ evaluation: evaluationsInfo, answers: statusAswers })
  // return res.status(200).json(idUser)
  } catch (error) {
    LOG.error(`error al guardar respuestas de usuario: ${error.message}`)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = evaluationAnswerRouter
