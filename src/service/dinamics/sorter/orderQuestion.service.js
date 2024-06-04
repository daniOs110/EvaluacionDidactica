const sorting = require('../../../model/schema/sorting.schema')
const sequelize = require('../../../config/database')

const LOG = require('../../../app/logger')
const Sorting = require('../../../model/schema/sorting.schema')
const Answers = require('../../../model/schema/evaluation.results.schema')
const Value = require('../../../model/schema/value.schema')
const Evaluation = require('../../../model/schema/evaluation.schemas')

class OrderQuestionService {
  async addLetter (letterData, userData /*, customizarPuntuacion, porcentaje */) {
    // const userId = userData.get('id_info_usuario')
    // const userName = userData.get('nombre')
    let transaction
    try {
      transaction = await sequelize.transaction()

      LOG.info(`la data traida es oracion: ${letterData.letter}, idEvalucion: ${letterData.idEvaluacion}, numPregunta: ${letterData.num_pregunta}`)
      const [existingSentece, created] = await sorting.findOrCreate({
        where: {
          id_evaluacion: letterData.idEvaluacion,
          num_pregunta: letterData.questionNumber
        },
        defaults: {
          oracion: letterData.letter,
          id_evaluacion: letterData.idEvaluacion,
          num_pregunta: letterData.questionNumber
        },
        transaction
      })
      if (!created) {
        LOG.info('oración previamente creada, se actualizo')
        existingSentece.oracion = letterData.letter
        await existingSentece.save({ transaction })
      }
      /* const idOrdenamiento = existingSentece.id_ordenamiento
      customizarPuntuacion = false
      if (customizarPuntuacion) {
        let existingValue = null
        LOG.debug(`Buscando o creando valor con id_ordenamiento: ${idOrdenamiento}`)
        // necesito saber el id_ordenamiento para buscar por id_ordenamiento en la tabla valor
        const [existingValueInstance, createdScore] = await Value.findOrCreate({
          where: {
            id_ordenamiento: idOrdenamiento
          },
          defaults: {
            id_ordenamiento: idOrdenamiento,
            porcentaje
          },
          transaction
        })
        LOG.debug(`Valor encontrado o creado: ${JSON.stringify(existingValueInstance)}, creado: ${createdScore}`)

        existingValue = existingValueInstance
        if (!createdScore) {
          LOG.info('Valor previamente creado, se actualiza el porcentaje')
          existingValue.porcentaje = porcentaje
          await existingValue.save({ transaction })
        }
      } */
      LOG.debug('Commit de la transacción')

      await transaction.commit()
      return { letter: existingSentece }
    } catch (error) {
      LOG.error(`Ocurrio un error al agregar la oracion a la evaluacion, error: ${error}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al agregar oracion a evaluación:' + error.message)
    }
  }

  async deleteSentence (orderId) {
    let transaction
    try {
      transaction = await sequelize.transaction()
      // Busca la entrada por su ID
      const existingSentence = await sorting.findByPk(orderId, { transaction })
      if (!existingSentence) {
        return null
      }
      // buscar en la tabla de resultado evaluaciones el campo id_pregunta_ordenamiento
      await Answers.destroy({
        where: {
          id_pregunta_ordenamiento: orderId
        },
        transaction
      })
      await Value.destroy({
        where: {
          id_ordenamiento: orderId
        },
        transaction
      })

      // Elimina la entrada
      await existingSentence.destroy({ transaction })

      // confirma la transaccion
      await transaction.commit()

      return { message: 'Oracion eliminada exitosamente.' }
    } catch (error) {
      LOG.error(`Ocurrió un error al eliminar la oración, error: ${error}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al eliminar oración:' + error.message)
    }
  }

  async deleteQuestion (idEvaluation, numQuestion) {
    let transaction
    try {
      transaction = await sequelize.transaction()
      // Busca la entrada por su ID
      const existingQuestion = await sorting.findAll({
        where: {
          id_evaluacion: idEvaluation,
          num_pregunta: numQuestion
        }
      }, { transaction })
      // Obtiene los id_ordenamiento de todas las entradas encontradas
      const idOrdenamientos = existingQuestion.map(question => question.id_ordenamiento)

      const idOrdenamiento = await sorting.findOne({
        attributes: ['id_ordenamiento'],
        where: {
          id_evaluacion: idEvaluation,
          num_pregunta: numQuestion,
          orden: 1
        }
      }, { transaction })

      if (!existingQuestion) {
        return { error: 'Not found', statusCode: 404, message: 'La oración con el numero de pregunta proporcionado no fue encontrada.' }
      }
      if (!idOrdenamiento) {
        return { error: 'Not found', statusCode: 404, message: 'La oración con el numero de pregunta proporcionado no fue encontrada.' }
      }
      // Extrae el valor del id_ordenamiento
      LOG.info(`El id de ordenamiento es ${idOrdenamiento.id_ordenamiento}`)
      // const idOrder = idOrdenamiento.id_ordenamiento

      // Elimina la entrada utilizando el id_ordenamiento
      await Answers.destroy({
        where: {
          id_pregunta_ordenamiento: idOrdenamientos
        },
        transaction
      })
      // eliminar valor asociado al item
      await Value.destroy({
        where: {
          id_ordenamiento: idOrdenamientos
        },
        transaction
      })

      // Elimina todas las entradas encontradas en sorting
      await sorting.destroy({
        where: {
          id_ordenamiento: idOrdenamientos
        },
        transaction
      })

      // confirma la transaccion
      await transaction.commit()

      return { message: 'Oracion eliminada exitosamente.' }
    } catch (error) {
      LOG.error(`Ocurrió un error al eliminar la oración, error: ${error}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al eliminar oración:' + error.message)
    }
  }

  async deleteItem (idEvaluation, numQuestion, idItem) {
    let transaction
    try {
      transaction = await sequelize.transaction()
      // Busca la entrada por su ID

      const idOrdenamiento = await sorting.findOne({
        attributes: ['id_ordenamiento'],
        where: {
          id_evaluacion: idEvaluation,
          num_pregunta: numQuestion,
          orden: idItem
        }
      }, { transaction })

      if (!idOrdenamiento) {
        return { error: 'Not found', statusCode: 404, message: 'La oración con el numero de pregunta proporcionado no fue encontrada.' }
      }
      // Extrae el valor del id_ordenamiento
      const idOrder = idOrdenamiento.id_ordenamiento
      LOG.info(`El id de ordenamiento es ${idOrder}`)

      // Elimina la entrada utilizando el id_ordenamiento
      await Answers.destroy({
        where: {
          id_pregunta_ordenamiento: idOrder
        },
        transaction
      })
      LOG.debug('Respuestas eliminadas correctamente')
      // eliminar valor asociado al item
      await Value.destroy({
        where: {
          id_ordenamiento: idOrder
        },
        transaction
      })
      LOG.debug('Valores eliminados correctamente')
      // Elimina todas las entradas encontradas en sorting
      await sorting.destroy({
        where: {
          id_ordenamiento: idOrder
        },
        transaction
      })
      LOG.debug('id ordenamiento eliminado correctamente')

      // confirma la transaccion
      await transaction.commit()

      return { message: 'item eliminado exitosamente.' }
    } catch (error) {
      LOG.error(`Ocurrió un error al eliminar el item, error: ${error}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al eliminar item:' + error.message)
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
        LOG.info('No se encontraron oraciones para la evaluación:', idEvaluacion)
        return null
      }
      // Crear un objeto para almacenar el par clave-valor (numPregunta - oracion)
      const sentencesMap = new Map()

      // Iterar sobre las oraciones encontradas y almacenarlas en el objeto
      sentences.forEach(sentence => {
        LOG.info(`Guardando la pregunta ${sentence.num_pregunta}, con el valor ${sentence.oracion}`)
        sentencesMap.set(sentence.num_pregunta, sentence.oracion)
      })

      const sentencesPlay = await this.unorderSentence(sentencesMap)
      if (sentencesPlay.size === 0) {
        throw new Error('Error al obtener las oraciones de la evaluación ')
      }

      if (sentencesPlay instanceof Map) {
        LOG.info('si es un mapa')
      }
      sentencesPlay.forEach((value, key) => {
        LOG.info(`the key of my map is ${key} and the value is ${value}`)
      })

      LOG.info('Transformando el mapa a respuesta json')

      const jsonObject = {}
      for (const [clave, valor] of sentencesPlay) {
        jsonObject[clave] = valor
      }

      // const jsonString = JSON.stringify(jsonObject)
      return { sentence: jsonObject }
    } catch (error) {
      // Manejar errores
      LOG.error('Error al obtener las oraciones de la evaluación get evaluation:', error)
      throw new Error('Error al obtener las oraciones de la evaluación')
    }
  }

  async getItemsEvaluationInOrder (idEvaluacion) {
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
        LOG.info(`Guardando la pregunta ${sentence.num_pregunta}, con el valor ${sentence.oracion} y el orden ${sentence.orden} y descripcion: ${sentence.instruccion} `)
        if (!sentencesMap.has(sentence.num_pregunta)) {
          sentencesMap.set(sentence.num_pregunta, {
            numPregunta: sentence.num_pregunta,
            descripcion: sentence.instruccion,
            respuestas: []
          })
        }
        const sentenceData = sentencesMap.get(sentence.num_pregunta)
        sentenceData.respuestas.push({ id: sentence.orden, texto: sentence.oracion })
      })

      // Transformar sentencesMap en el formato deseado
      const sentencesArray = Array.from(sentencesMap.values())
      return { sortItemsActivities: sentencesArray }
    } catch (error) {
      // Manejar errores
      LOG.error('Error al obtener las oraciones de la evaluación get evaluation:', error)
      throw new Error('Error al obtener las oraciones de la evaluación')
    }
  }

  async getItemsEvaluation (idEvaluacion) {
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
        LOG.info(`Guardando la pregunta ${sentence.num_pregunta}, con el valor ${sentence.oracion} y el orden ${sentence.orden}`)
        if (!sentencesMap.has(sentence.num_pregunta)) {
          sentencesMap.set(sentence.num_pregunta, [])
        }
        sentencesMap.get(sentence.num_pregunta).push({ orden: sentence.orden, oracion: sentence.oracion, instruccion: sentence.instruccion })
      })

      const sentencesPlay = await this.unorderItems(sentencesMap)
      if (sentencesPlay.size === 0) {
        throw new Error('Error al obtener las oraciones de la evaluación ')
      }

      if (sentencesPlay instanceof Map) {
        LOG.info('si es un mapa')
      }

      const jsonObject = {}
      for (const [clave, valor] of sentencesPlay) {
        jsonObject[clave] = valor
      }

      // const jsonString = JSON.stringify(jsonObject)
      return { sentence: jsonObject }
    } catch (error) {
      // Manejar errores
      LOG.error('Error al obtener las oraciones de la evaluación get evaluation:', error)
      throw new Error('Error al obtener las oraciones de la evaluación')
    }
  }

  async unorderItems (sentenceMap) {
    const response = new Map()
    let instruction
    // Iterar sobre el map agrupado
    sentenceMap.forEach((sentences, numPregunta) => {
      LOG.info(`Procesando la pregunta ${numPregunta}`)

      instruction = sentences.map(sentence => ({ instruccion: sentence.instruccion }))
      const instructionShow = instruction[0]
      const pairs = sentences.map(sentence => ({ orden: sentence.orden, oracion: sentence.oracion }))

      // desordenar el array
      const shuffledPairs = this.shuffleArray(pairs)

      // separamos los pares desordenados en un array de orden - oracion
      // const shuffledOrdenes = shuffledPairs.map(pair => pair.orden)
      // const shuffledOraciones = shuffledPairs.map(pair => pair.oracion)
      const items = shuffledPairs.map(pair => ({
        orden: pair.orden,
        oracion: pair.oracion
      }))
      response.set(numPregunta, { numPregunta, instructionShow, items })
    })

    return response
  }

  // Función para desordenar un array (algoritmo de Fisher-Yates)
  shuffleArray (array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  async unorderSentence (sentenceMap) {
    // recibo una oracion y la devuelvo desordenada
    const sizeMap = sentenceMap.size
    const map = sentenceMap
    const sentencesPlay = new Map()
    let response = new Map()

    let value = null
    LOG.info(`El tamaño del mapa es: ${sizeMap}`)
    for (let i = 1; i <= sizeMap; i++) {
      value = map.get(i)
      LOG.info(`la información obtenida del mapa es: ${map.get(i)}`)
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
          LOG.info(`La ultima palabra ${palabras[i]} es menor o igual a 2 caracteres `)
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

  async getActivities (idEvaluacion) {
    try {
      LOG.info(`El id de evaluacion es: ${idEvaluacion}`)
      const sentences = await Sorting.findAll({
        where: {
          id_evaluacion: idEvaluacion
        }
      })
      if (sentences.length === 0) {
        return null
      }
      return sentences
    } catch (error) {
      LOG.error('Error al obtener las oraciones de la evaluación get activities:', error)
      throw new Error('Error al obtener las oraciones de la evaluación')
    }
  }

  async updateCustomScore (idEvaluation, customScoreStatus) {
    const transaction = await sequelize.transaction()
    try {
      const customScore = await Evaluation.findByPk(idEvaluation)
      if (customScore) {
        customScore.customizar_puntuacion = customScoreStatus
        await customScore.save({ transaction })
        LOG.info('Información de evaluación encontrada y actualizada.')
      } else {
        LOG.info('No se encontró la evaluación con el id proporcionado.')
      }
      await transaction.commit()
      return 'update custom score status'
    } catch (error) {
      LOG.error(`Ocurrio un error al actualizar el campo de la tabla evaluacion, error: ${error.message}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al agregar oracion a evaluación:' + error.message)
    }
  }

  async addItems (instruccion, idEvaluacion, numPregunta, orden, oracion/*, porcentaje, customizarPuntuacion */) {
    // guardarla en DB
    const transaction = await sequelize.transaction()
    try {
      LOG.info(`la informacion traida es oracion: ${oracion}, idEvalucion: ${idEvaluacion}, numPregunta: ${numPregunta}, orden: ${orden}, 
      instruccion: ${instruccion}`)
      const [existingSortItem, created] = await sorting.findOrCreate({
        where: {
          id_evaluacion: idEvaluacion,
          num_pregunta: numPregunta,
          orden
        },
        defaults: {
          oracion,
          id_evaluacion: idEvaluacion,
          num_pregunta: numPregunta,
          orden,
          instruccion
        },
        transaction
      })
      if (!created) {
        LOG.info('oración previamente creada, se actualizo')
        existingSortItem.oracion = oracion
        existingSortItem.instruccion = instruccion
        existingSortItem.orden = orden
        await existingSortItem.save({ transaction })
      }
      const idOrdenamiento = existingSortItem.id_ordenamiento
      LOG.debug(`el id de ordentamiento es ${idOrdenamiento}`)

      await transaction.commit()
      return { item: existingSortItem }
    } catch (error) {
      LOG.error(`Ocurrio un error al agregar las oraciones a la evaluacion, error: ${error.message}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al agregar oracion a evaluación:' + error.message)
    }
  }

  /* async updateScore (customizarPuntuacion, idOrdenamiento, porcentaje) {
    const transaction = await sequelize.transaction({ timeout: 5000 }) // Añadir un timeout de 5 segundos
    try {
      let existingValue = null
      if (customizarPuntuacion) {
        LOG.debug(`Buscando o creando valor con id_ordenamiento: ${idOrdenamiento}`)
        // necesito saber el id_ordenamiento para buscar por id_ordenamiento en la tabla valor
        const [existingValueInstance, createdScore] = await Value.findOrCreate({
          where: {
            id_ordenamiento: idOrdenamiento
          },
          defaults: {
            id_ordenamiento: idOrdenamiento,
            porcentaje
          },
          transaction
        })
        LOG.debug(`Valor encontrado o creado: ${JSON.stringify(existingValueInstance)}, creado: ${createdScore}`)

        existingValue = existingValueInstance
        if (!createdScore) {
          LOG.info('Valor previamente creado, se actualiza el porcentaje')
          existingValue.porcentaje = porcentaje
          await existingValue.save({ transaction })
        }
      }
      LOG.debug('Commit de la transacción')
      await transaction.commit()
      return existingValue
    } catch (error) {
      LOG.error(`Ocurrio un error al actualizar el porcentaje en la tabla valor, error: ${error.message()}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al agregar el porcentaje a la evaluación:' + error.message)
    }
  } */
}

module.exports = new OrderQuestionService()
