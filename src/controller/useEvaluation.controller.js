const useEvaluationRouter = require('express').Router()
const Hashids = require('hashids/cjs')
const hashids = new Hashids('clave-secreta')
const LOG = require('../app/logger')
const authMiddleware = require('../middleware/session')
const authTypeUserMiddleware = require('../middleware/logged')
const EvaluationService = require('../service/evaluation.service')
const createEvaluationService = require('../service/createEvaluation.service')
const orderQuestionService = require('../service/dinamics/sorter/orderQuestion.service')
const AnswerEvaluationService = require('../service/answerEvaluation.service')
const questionAnswerService = require('../service/dinamics/questionAnswer/questionAnswer.service')

useEvaluationRouter.get('/evaluation/share/:idEvaluation', authMiddleware, async (req, res) => {
  const idEvaluation = req.params.idEvaluation
  // Este metodo se llamadra cuando el usuario (profesor) pulse el boton compartir evalucion, generara un token con los datos de la evaluacion
  try {
    const pin = await EvaluationService.getPin(idEvaluation)
    if (pin === null) {
      return res.status(500).send('Hubo un error al al generar el pin de evaluación.')
    }
    return res.status(200).send(pin)
  } catch (error) {
    LOG.error(`error al generar el pin de evaluación ${error}`)
    return res.status(500).send('Hubo un error al al generar el pin de evaluación.')
  }
})

useEvaluationRouter.post('/evaluation/decodePin', async (req, res) => {
  const pin = req.body.pin

  LOG.info(`El pin es ${pin}`)
  const decode = hashids.decode(pin)
  LOG.info(`El id de la evaluacion es: ${decode}`)
  return res.status(200).json(decode)
})

useEvaluationRouter.post('/evaluation/joinEvaluation', authTypeUserMiddleware, async (req, res) => {
// revisar si esta logueado
  const user = req.user
  const typeUser = req.type
  const pin = req.body.pin
  // saber id de usuario para verificar que no haya contestado la evaluación
  if (user === null || user === undefined) {
    return res.status(500).json({ message: 'el usuario es nulo o indefinido' })
  }
  let idUser
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
  // decodificar el pin para saber a que evaluacion pertenece
  const decode = hashids.decode(pin)
  LOG.info(decode)
  LOG.info(`The id evaluation decode is ${decode} and his type: ${typeof decode}`)
  if (decode.length === 0) {
    LOG.error('PIN is invalid')
    return res.status(404).json({ message: 'Codigo invalido' })
  }
  if (decode == null || decode === undefined || decode === '') {
    return res.status(404).json({ message: 'Codigo invalido' })
  }
  const idEvaluation = parseInt(decode)
  // traer los datos de la evaluación
  const evaluationsInfo = await createEvaluationService.findEvaluationById(idEvaluation)
  if (evaluationsInfo === null) {
    return res.status(404).json({ message: 'No se encontraron evaluaciones asociadas al id de evaluación' })
  }
  // que tipo de evaluacion es
  const typeEvaluation = evaluationsInfo.get('id_dinamica')
  let typeDinamic

  let isActive = evaluationsInfo.get('active')
  LOG.info(`The atibute isActive of evaluation is: ${isActive}`)

  // verificar que la evaluación entre en los rangos de activa
  const now = new Date()
  const activationDate = new Date(`${evaluationsInfo.get('fecha_activacion')}T${evaluationsInfo.get('hora_activacion')}`)
  const deactivationDate = evaluationsInfo.get('fecha_desactivacion')
    ? new Date(`${evaluationsInfo.get('fecha_desactivacion')}T${evaluationsInfo.get('hora_desactivacion')}`)
    : null

  /* if (now < activationDate || (deactivationDate && now > deactivationDate)) {
    LOG.error(`The evaluation with id: ${idEvaluation} is out of the active period`)
    return res.status(404).json({ message: 'Evaluación fuera del periodo activo' })
  } */
  /** *** test */
  LOG.info(`activation date = ${activationDate} and deactivation date = ${deactivationDate} and now = ${now}`)
  if (now >= activationDate && (!deactivationDate || now <= deactivationDate)) {
    if (!isActive) {
      // Actualizar a activo si no lo está
      isActive = true
      await createEvaluationService.updateEvaluationStatus(idEvaluation, true) // crear este metodo
      LOG.info(`Evaluation with id: ${idEvaluation} has been activated`)
    }
  } else {
    if (isActive) {
      // Actualizar a inactivo si no lo está
      isActive = false
      await createEvaluationService.updateEvaluationStatus(idEvaluation, false)
      LOG.info(`Evaluation with id: ${idEvaluation} has been deactivated`)
    }
  }
  /** */
  // Verificar que el id de evaluacion exista y este activa si no mandar mensaje de error
  if (!isActive) {
    LOG.error(`The evaluation with id: ${idEvaluation} is inactive`)
    return res.status(404).json({ message: 'Evaluación inactiva' })
  }
  // verificar que no se haya respondido antes la evaluacion por el mismo usuario
  const evaluationAnswered = await AnswerEvaluationService.alreadyAnswered(idEvaluation, idUser, typeUser)
  if (evaluationAnswered.error) {
    // Si se encontró un error, se devuelve el código de estado correspondiente
    return res.status(evaluationAnswered.statusCode).json({ error: evaluationAnswered.error, message: evaluationAnswered.message })
  }
  LOG.info(`Service alreadyAnswered say ${evaluationAnswered.data}`)
  let dataEvaluation
  switch (typeEvaluation) {
    case 1:
      LOG.info('Es tipo ordena la pregunta')
      dataEvaluation = await orderQuestionService.getEvaluation(idEvaluation)
      if (dataEvaluation === null) {
        return res.status(404).json({ message: 'No se encontro evaluación' })
      }
      break
    case 2:
      LOG.info('Es tipo ordena los items')
      typeDinamic = 'ordena los item'
      dataEvaluation = await orderQuestionService.getItemsEvaluation(idEvaluation)
      if (dataEvaluation === null) {
        return res.status(404).json({ message: 'No se encontro evaluación' })
      }
      break
    case 3:
      LOG.info('Opción multiple')
      typeDinamic = 'Opción multiple'
      dataEvaluation = await questionAnswerService.getQuestionAnswerEvaluation(idEvaluation)
      if (dataEvaluation === null) {
        return res.status(404).json({ message: 'No se encontro evaluación' })
      }
      break
    case 5:
      LOG.info('Crucigrama')
      dataEvaluation = await questionAnswerService.getCrosswordEvaluation(idEvaluation)
      if (dataEvaluation === null) {
        return res.status(404).json({ message: 'No se encontro evaluación' })
      }
      break
    case 6:
      LOG.info('Sopa de letras')
      typeDinamic = 'Sopa de letras'
      dataEvaluation = await questionAnswerService.getWordSearchEvaluation(idEvaluation)
      if (dataEvaluation.error) {
        // Si se encontró un error, se devuelve el código de estado correspondiente
        return res.status(dataEvaluation.statusCode).json({ error: dataEvaluation.error, message: dataEvaluation.message })
      }
      if (dataEvaluation === null) {
        return res.status(404).json({ message: 'No se encontro evaluación' })
      }
      break
  }

  LOG.info(`El tipo de evaluacion es ${typeEvaluation}`)
  LOG.info(`El tipo de dinamica es: ${typeDinamic}`)
  LOG.info(`El id de la evaluacion es: ${decode}`)
  LOG.info(`el pin es: ${pin} y el tipo de usuario es ${typeUser}`)

  return res.status(200).json({ infoEvaluation: evaluationsInfo, dataEvaluation })
  // return res.send('pasaste al servicio join evaluation')
})
module.exports = useEvaluationRouter
