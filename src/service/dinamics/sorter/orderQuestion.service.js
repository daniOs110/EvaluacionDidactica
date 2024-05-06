const sorting = require('../../../model/schema/sorting.schema')
const sequelize = require('../../../config/database')

const LOG = require('../../../app/logger')
const Sorting = require('../../../model/schema/sorting.schema')

class OrderQuestionService {
  async addLetter (letterData, userData) {
    // const userId = userData.get('id_info_usuario')
    // const userName = userData.get('nombre')
    let transaction
    try {
      transaction = await sequelize.transaction()

      LOG.info(`la data traida es oracion: ${letterData.letter}, idEvalucion: ${letterData.idEvaluacion}, numPregunta: ${letterData.num_pregunta}`)
      const newLetter = await sorting.create({
        oracion: letterData.letter,
        id_evaluacion: letterData.idEvaluacion,
        num_pregunta: letterData.questionNumber
      }, { transaction })

      await transaction.commit()
      return { letter: newLetter }
    } catch (error) {
      LOG.error(`Ocurrio un error al agregar la oracion a la evaluacion, error: ${error}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al agregar oracion a evaluación:' + error.message)
    }
  }

  async getEvaluation (idEvaluacion) {
    try {
      // Buscar todas las oraciones que pertenecen a la evaluación con el id dado
      LOG.info(`El id de evaluacion es: ${idEvaluacion}`)
      const sentences = await Sorting.findAll({
        where: {
          id_evaluacion: idEvaluacion
        }
      })
      if (sentences.length === 0) {
        console.log('No se encontraron oraciones para la evaluación:', idEvaluacion)
        return null
      }
      // Crear un objeto para almacenar el par clave-valor (numPregunta - oracion)
      const sentencesMap = new Map()

      // Iterar sobre las oraciones encontradas y almacenarlas en el objeto
      sentences.forEach(sentence => {
        sentencesMap.set(sentence.num_pregunta, sentence.oracion)
      })

      const sentencesPlay = await this.unorderSentence(sentencesMap)
      if (sentencesPlay.size === 0) {
        throw new Error('Error al obtener las oraciones de la evaluación')
      }
      return { sentence: sentencesPlay }
    } catch (error) {
      // Manejar errores
      LOG.error('Error al obtener las oraciones de la evaluación:', error)
      throw new Error('Error al obtener las oraciones de la evaluación')
    }
  }

  async unorderSentence (sentenceMap) {
    // recibo una oracion y la devuelvo desordenada
    const sizeMap = sentenceMap.size
    const map = sentenceMap
    const sentencesPlay = new Map()
    let response = new Map()

    let value
    LOG.info(`El tamaño del mapa es: ${sizeMap}`)
    for (let i = 1; i < sizeMap + 1; i++) {
      value = map.get(i)

      // desordenar palabra
      response = await this.unorder(i, value, sentencesPlay)
      LOG.info(`el mapa tiene el dato ${i}: ${response.get(i)}`)
    }
    return response
  }

  async unorder (numPregunta, sentence, sentencePlay) {
    const palabras = sentence.split(' ')
    for (let i = 0; i < palabras.length; i++) {
      if ((palabras.length - 1) === i) {
        LOG.info(`La ultima palabra es: ${palabras[i]}`)
        if (palabras[i].length < 3) {
          LOG.info(`La ultima palabra palabra ${palabras[i]} es menor o igual a 2 caracteres `)
          palabras[i - 1] = palabras[i - 1] + ' ' + palabras[i]
          palabras.splice(i, 1) // delete word < 2
        }
      } else if (palabras[i].length < 3) {
        LOG.info(`La palabra ${palabras[i]} es menor o igual a 2 caracteres `)
        palabras[i + 1] = palabras[i] + ' ' + palabras[i + 1]
        palabras.splice(i, 1) // delete word < 2
      }
    }

    // Función de comparación para ordenar de forma aleatoria
    const compararAleatorio = () => Math.random() - 0.5

    // Desordenar las palabras
    const palabrasDesordenadas = palabras.sort(compararAleatorio)
    sentencePlay.set(numPregunta, palabrasDesordenadas)

    return sentencePlay
  }
}

module.exports = new OrderQuestionService()
