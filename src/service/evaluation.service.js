const Hashids = require('hashids/cjs')
const hashids = new Hashids('clave-secreta')
const LOG = require('../app/logger')

class EvaluationService {
  async getPin (idEvaluacion) {
    const pinNumber = hashids.encode(idEvaluacion)
    if (pinNumber === null || pinNumber === ' ') {
      return null
    }
    LOG.info(`El pin se genero con exito, pin: ${pinNumber}`)
    return { pin: pinNumber }
  }

  async decodePin (pin) {
    // logica para decodificar el pin
  }
}

module.exports = new EvaluationService()
