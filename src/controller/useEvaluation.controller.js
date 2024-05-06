const useEvaluationRouter = require('express').Router()
const Hashids = require('hashids/cjs')
const hashids = new Hashids('clave-secreta')
const LOG = require('../app/logger')
const authMiddleware = require('../middleware/session')
const areLoggedin = require('../middleware/logged')
const EvaluationService = require('../service/evaluation.service')

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

useEvaluationRouter.post('/evaluation/decodePin', authMiddleware, async (req, res) => {
  const pin = req.body.pin

  LOG.info(`El pin es ${pin}`)
  const decode = hashids.decode(pin)
  LOG.info(`El id de la evaluacion es: ${decode}`)
  return res.status(200).json(decode)
})

useEvaluationRouter.post('/evaluation/joinEvaluation', areLoggedin, async (req, res) => {
// revisar si esta logueado
  const user = req.user
  const pin = req.body.pin

  const guestUsertId = user.get('id_usuarios_invitados')
  const registerUserId = user.get('id_info_usuario')
  let userId
  // separar usuario invitado y usuario registrado
  if (!guestUsertId === undefined) {
    LOG.info('Es usuario invitado')
    userId = guestUsertId
  } else if (!registerUserId === undefined) {
    LOG.info('Es usuario registrado')
    userId = registerUserId
  } else {
    LOG.error('No es ningun tipo de usuario error')
  }

  LOG.info(`el pin es: ${pin} y el id de usuario es ${userId}`)

  // revisar si esta activa la evaluacion

  return res.send('pasaste al servicio join evaluation')
})
module.exports = useEvaluationRouter
