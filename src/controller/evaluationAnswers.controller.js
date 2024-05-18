const evaluationAnswerRouter = require('express').Router()
const LOG = require('../app/logger')
const authTypeUserMiddleware = require('../middleware/logged')
const answerEvaluationService = require('../service/answerEvaluation.service')

const createEvaluationService = require('../service/createEvaluation.service')
const orderQuestionService = require('../service/dinamics/sorter/orderQuestion.service')

evaluationAnswerRouter.post('/answer/sortSentence', authTypeUserMiddleware, async (req, res) => {
  const user = req.user
  const typeUser = req.type
  /**
   * idEvaluacion
   * idPreguntaOrdenamiento (numPregunta/oracion)
   * idUsuarioInvitado/idUsuarioRegistrado (lo saco del token)
   */
  let idUser
  LOG.info(`the type of user is ${typeUser} and the user is ${user}`)
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
  // ahora debo saber las respuestas correctas asociadas a la evaluación y las que el usuario contesto

  return res.status(200).json(idUser)
})

module.exports = evaluationAnswerRouter
