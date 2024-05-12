const useEvaluationRouter = require('express').Router()
const Hashids = require('hashids/cjs')
const hashids = new Hashids('clave-secreta')
const LOG = require('../app/logger')
const authMiddleware = require('../middleware/session')
const authTypeUserMiddleware = require('../middleware/logged')
const EvaluationService = require('../service/evaluation.service')
const createEvaluationService = require('../service/createEvaluation.service')
const orderQuestionService = require('../service/dinamics/sorter/orderQuestion.service')

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
  // decodificar el pin para saber a que evaluacion pertenece
  const decode = hashids.decode(pin)
  const idEvaluation = parseInt(decode)
  // traer los datos de la evaluación
  const evaluationsInfo = await createEvaluationService.findEvaluationById(idEvaluation)
  if (evaluationsInfo === null) {
    return res.status(404).json({ message: 'No se encontraron evaluaciones asociadas al id de evaluación' })
  }
  // que tipo de evaluacion es
  const typeEvaluation = evaluationsInfo.get('id_dinamica')
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
      break
    case 3:
      LOG.info('Es tipo gato')
      break
  }

  LOG.info(`El tipo de evaluacion es ${typeEvaluation}`)
  LOG.info(`El id de la evaluacion es: ${decode}`)
  LOG.info(`el pin es: ${pin} y el tipo de usuario es ${typeUser}`)

  // revisar si esta activa la evaluacion

  return res.status(200).json(dataEvaluation)
  // return res.send('pasaste al servicio join evaluation')
})
module.exports = useEvaluationRouter
