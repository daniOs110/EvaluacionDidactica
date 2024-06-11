const evaluation = require('../model/schema/evaluation.schemas')
const dinamics = require('../model/schema/dinamic.schema')
const clasification = require('../model/schema/clasifications.schema')
const sort = require('../model/schema/sorting.schema')
const question = require('../model/schema/questions.schema')
const answer = require('../model/schema/response.schema')
const AnswersEvaluation = require('../model/schema/evaluation.results.schema')
const board = require('../model/schema/board.schema')
const { Sequelize } = require('sequelize')

const sequelize = require('../config/database')
// const { parseISO, format, isBefore, isEqual, parse } = require('date-fns')
const TIMEZONE = process.env.TIME_ZONE
const LOG = require('../app/logger')
const PosicionCrucigrama = require('../model/schema/positionCrosswords.schema')

class CreateEvaluationService {
  async duplicateEvaluation (idEvaluacion, userId) {
    try {
      // Buscar la evaluación original
      LOG.debug(`id evalutaion is ${idEvaluacion}`)
      const originalEvaluation = await evaluation.findByPk(idEvaluacion)
      const idDinamic = originalEvaluation.get('id_dinamica')
      if (!originalEvaluation) {
        return { error: 'Not found', statusCode: 404, message: 'No se encontro evaluación asociada al id' }
      }

      // Crear un nuevo objeto de evaluación duplicada
      const newEvaluationData = {
        ...originalEvaluation.toJSON(),
        id_evaluaciones: null, // Dejar que la base de datos asigne un nuevo ID
        nombre: `${originalEvaluation.nombre} - Copia`,
        fecha_creacion: new Date(), // Usar la fecha actual
        id_usuario: userId // Asumir que el usuario actual es el creador de la nueva evaluación
      }

      // Insertar la nueva evaluación en la base de datos

      const newEvaluation = await evaluation.create(newEvaluationData)
      const newIdEvaluation = newEvaluation.get('id_evaluaciones')
      let sortData
      let questioAnswerData
      if (idDinamic === 1 || idDinamic === 2) {
        sortData = await this.duplicateOrdenamientos(idEvaluacion, idDinamic, newIdEvaluation)
        return { newEvaluation, sortData }
      } else if (idDinamic === 3 || idDinamic === 5 || idDinamic === 6) {
        questioAnswerData = await this.duplicatePreguntas(idEvaluacion, idDinamic, newIdEvaluation)
        return { newEvaluation, questioAnswerData }
      }
      // Devolver la nueva evaluación
      return { newEvaluation }
    } catch (error) {
      throw new Error(`Error al duplicar la evaluación: ${error.message}`)
    }
  }

  async duplicatePreguntas (idEvaluacion, idDinamica, newIdEvaluation) {
    try {
      LOG.info(`Duplicating question of id evaluation ${idEvaluacion}`)
      let preguntas = []
      let preguntasMap = {}
      // Duplicar tablero
      let newBoard
      if (idDinamica === 5 || idDinamica === 6) {
        newBoard = await this.duplicateBoard(idEvaluacion, newIdEvaluation)
      }
      // Duplicar preguntas
      if (idDinamica === 3 || idDinamica === 5 || idDinamica === 6) {
        const result = await this.duplicatePreguntasGenerales(idEvaluacion, newIdEvaluation)
        preguntas = result.duplicatedPreguntas
        preguntasMap = result.idMap
      }

      // Duplicar datos específicos según el tipo de dinámica
      if (idDinamica === 5) {
        for (const key in preguntasMap) {
          if (preguntasMap.hasOwnProperty(key)) {
            const value = preguntasMap[key]
            console.log(`Clave: ${key}, Valor: ${value}`)
          }
        }
        const answersCrossword = await this.duplicatePosicionesCrucigrama(idEvaluacion, preguntasMap)

        return { preguntas, answersCrossword, newBoard }
      } else if (idDinamica === 3) {
        const answer = await this.duplicateRespuestas(idEvaluacion, preguntasMap)
        return { preguntas, answer }
      }

      return preguntas
    } catch (error) {
      throw new Error(`Error al duplicar las preguntas: ${error.message}`)
    }
  }

  async duplicateBoard (idEvaluacion, newIdEvaluation) {
    try {
      // Obtener las preguntas para la evaluación específica
      const originalBoard = await board.findOne({
        where: {
          id_evaluacion: idEvaluacion
        }
      })
      // Crear una copia de la pregunta con un nuevo id_pregunta
      const newBoard = await board.create({
        id_evaluacion: newIdEvaluation, // Dejar que la base de datos asigne un nuevo ID
        columna: originalBoard.get('columna'),
        fila: originalBoard.get('fila')
      })

      return { newBoard }
    } catch (error) {
      throw new Error(`Error al duplicar las preguntas generales: ${error.message}`)
    }
  }

  async duplicatePreguntasGenerales (idEvaluacion, newIdEvaluation) {
    try {
      // Obtener las preguntas para la evaluación específica
      const preguntas = await question.findAll({
        where: {
          id_evaluacion: idEvaluacion
        }
      })

      // Crear un mapeo de IDs originales a nuevas IDs
      const idMap = {}

      // Duplicar las preguntas
      const duplicatedPreguntas = await Promise.all(preguntas.map(async (preguntaIteration) => {
        const { id_pregunta, pregunta, numero_respuestas, num_pregunta } = preguntaIteration.toJSON()

        // Crear una copia de la pregunta con un nuevo id_pregunta
        const newPregunta = await question.create({
          id_evaluacion: newIdEvaluation, // Dejar que la base de datos asigne un nuevo ID
          pregunta,
          numero_respuestas,
          num_pregunta
        })

        // Añadir al mapeo
        idMap[id_pregunta] = newPregunta.get('id_pregunta')

        return newPregunta
      }))

      return { duplicatedPreguntas, idMap }
    } catch (error) {
      throw new Error(`Error al duplicar las preguntas generales: ${error.message}`)
    }
  }

  /* async duplicatePreguntasGenerales2(idEvaluacion, newIdEvaluation) {
    try {
      // Obtener las preguntas para la evaluación específica
      const preguntas = await question.findAll({
        where: {
          id_evaluacion: idEvaluacion
        }
      })

      // Duplicar las preguntas
      const duplicatedPreguntas = await Promise.all(preguntas.map(async (preguntaIteration) => {
        const { id_pregunta, pregunta, numero_respuestas, num_pregunta } = preguntaIteration.toJSON()

        // Crear una copia de la pregunta con un nuevo id_pregunta
        const newPregunta = await question.create({
          id_evaluacion: newIdEvaluation, // Dejar que la base de datos asigne un nuevo ID
          pregunta,
          numero_respuestas,
          num_pregunta
        })

        return newPregunta
      }))

      return duplicatedPreguntas
    } catch (error) {
      throw new Error(`Error al duplicar las preguntas generales: ${error.message}`)
    }
  } */

  async duplicateOrdenamientos (idEvaluacion, idDinamica, newIdEvaluation) {
    try {
      // Obtener los registros de ordenamiento para la evaluación y la dinámica específicas
      const ordenamientos = await sort.findAll({
        where: {
          id_evaluacion: idEvaluacion
        }
      })

      // Duplicar los registros y actualizar el id_evaluacion
      const duplicatedOrdenamientos = await Promise.all(ordenamientos.map(async (ordenamiento) => {
        const { id_ordenamiento, oracion, num_pregunta, orden, instruccion } = ordenamiento.toJSON()

        // Crear una copia del registro con un nuevo id_ordenamiento
        const newOrdenamiento = await sort.create({
          oracion,
          id_evaluacion: newIdEvaluation, // Dejar que la base de datos asigne un nuevo ID
          num_pregunta,
          orden,
          instruccion
        })

        return newOrdenamiento
      }))

      return duplicatedOrdenamientos
    } catch (error) {
      throw new Error(`Error al duplicar los ordenamientos: ${error.message}`)
    }
  }

  async duplicateRespuestas (idEvaluacion, idMap) {
    try {
      const respuestas = await answer.findAll({
        where: {
          id_pregunta: {
            [Sequelize.Op.in]: Object.keys(idMap).map(key => parseInt(key))
          }
        }
      })

      const duplicatedRespuestas = await Promise.all(respuestas.map(async (respuesta) => {
        const { id_respuesta, opcion_respuesta_texto, status_respuesta, id_tipo_respuesta, opcion_respuesta_imagen, id_opcion } = respuesta.toJSON()
        // const nuevaPreguntaId = idMap[respuesta.id_pregunta]
        LOG.debug(`la posicion a buscar en el mapa es ${respuesta.get('id_pregunta')}`)
        const nuevaPreguntaId = idMap[respuesta.get('id_pregunta')]
        LOG.debug(`nueva pregunta id: ${nuevaPreguntaId}`)

        if (!nuevaPreguntaId) {
          throw new Error(`No se encontró un nuevo ID para la pregunta original ${respuesta.id_pregunta}`)
        }

        const nuevaRespuesta = await answer.create({
          id_pregunta: nuevaPreguntaId,
          opcion_respuesta_texto,
          status_respuesta,
          id_tipo_respuesta,
          opcion_respuesta_imagen,
          id_opcion
        })

        return nuevaRespuesta
      }))

      return duplicatedRespuestas
    } catch (error) {
      throw new Error(`Error al duplicar las respuestas: ${error.message}`)
    }
  }

  async duplicatePosicionesCrucigrama (idEvaluacion, idMap) {
    try {
      LOG.info(`Duplicating answers of crossWord ${idEvaluacion}`)

      const questions = await question.findAll({
        where: {
          id_evaluacion: idEvaluacion
        }
      })

      // Obtener las posiciones de crucigrama para las preguntas de la evaluación específica
      const posiciones = await PosicionCrucigrama.findAll({
        where: {
          id_pregunta: {
            [Sequelize.Op.in]: questions.map(pregunta => pregunta.id_pregunta)
          }
        }
      })

      LOG.info(`El array tiene una longitud = ${posiciones.length}`)

      // Duplicar las posiciones de crucigrama y asociarlas a las nuevas preguntas
      const duplicatedPosiciones = await Promise.all(posiciones.map(async (posicion) => {
        const { id_posicion_crucigrama, respuesta_texto, orientacion, inicio_x, inicio_y } = posicion.toJSON()

        // Obtener la nueva ID de pregunta desde el mapeo
        LOG.debug(`la posicion a buscar en el mapa es ${posicion.get('id_pregunta')}`)
        const nuevaPreguntaId = idMap[posicion.get('id_pregunta')]
        LOG.debug(`nueva pregunta id: ${nuevaPreguntaId}`)

        // Crear una copia de la posición de crucigrama asociada a la nueva pregunta
        const nuevaPosicion = await PosicionCrucigrama.create({
          id_pregunta: nuevaPreguntaId,
          respuesta_texto,
          orientacion,
          inicio_x,
          inicio_y
        })

        return nuevaPosicion
      }))

      return duplicatedPosiciones
    } catch (error) {
      throw new Error(`Error al duplicar las posiciones de crucigrama: ${error.message}`)
    }
  }

  async getDinamicInfo () {
    LOG.info('Buscando los datos de la tabla "dinamica"')
    try {
      const dinamicInfo = await dinamics.findAll()
      if (dinamicInfo.length === 0) {
        LOG.info('no se encontro informacion en la tabla de dinamicas')
        return null
      }

      return dinamicInfo
    } catch (error) {
      LOG.error(`Ocurrio un error al buscar datos de dinamica: ${error}`)
      throw new Error('Error al buscar datos de dinamica:' + error.message)
    }
  }

  async getClasificationInfo () {
    LOG.info('Buscando los datos de la tabla "clasificacion"')
    try {
      const clasificationInfo = await clasification.findAll()
      if (clasificationInfo.length === 0) {
        LOG.info('no se encontro informacion en la tabla de clasificacion')
        return null
      }
      return clasificationInfo
    } catch (error) {
      LOG.error(`Ocurrio un error al buscar datos de clasificacion: ${error}`)
      throw new Error('Error al buscar datos de clasificacion:' + error.message)
    }
  }

  async getCombinedInfo () {
    LOG.info('Buscando los datos de la tabla "dinamica" y "clasificacion"')
    try {
      const dinamicInfo = await dinamics.findAll({
        include: [{
          model: clasification,
          as: 'clasificacion',
          required: true // Para asegurar que solo obtenga registros que tengan una clasificación asociada
        }]
      })

      if (dinamicInfo.length === 0) {
        LOG.info('No se encontró información en la tabla de dinamicas')
        return null
      }

      // Mapear los resultados para combinar la información
      const combinedInfo = dinamicInfo.map(dinamic => ({
        id_dinamicas: dinamic.id_dinamicas,
        dinamica: dinamic.dinamica,
        descripcion: dinamic.descripcion,
        clasification: {
          id_clasificacion: dinamic.clasificacion.id_clasificacion,
          clasificacion: dinamic.clasificacion.clasificacion
        }
      }))

      return combinedInfo
    } catch (error) {
      LOG.error(`Ocurrió un error al buscar datos de dinámica o clasificación: ${error}`)
      throw new Error('Error al buscar datos de dinámica o clasificación: ' + error.message)
    }
  }

  async findAllEvaluations (userData) {
    const userId = userData.get('id_info_usuario')
    const userName = userData.get('nombre')
    LOG.info(`Creando evaluación para el usuario ${userName}, con id: ${userId}`)
    try {
      const evaluationsInfo = await evaluation.findAll({
        where: {
          id_usuario: userId
        }
      })
      if (evaluationsInfo.length === 0) {
        LOG.info('no se encontraron evaluaciones asociadas al usuario')
        return null
      }
      return evaluationsInfo
    } catch (error) {
      LOG.error(`Ocurrio un error al buscar las evaluaciones asociadas al usuario, error: ${error}`)
      throw new Error('Error al crear el evaluación:' + error.message)
    }
  }

  async findEvaluationById (idEvaluacion) {
    try {
      const evaluationsInfo = await evaluation.findByPk(idEvaluacion)
      if (evaluationsInfo === undefined) {
        LOG.info('no se encontraron evaluaciones asociadas al id de evaluacion')
        return null
      }
      return evaluationsInfo
    } catch (error) {
      LOG.error(`Ocurrio un error al buscar la evaluacion asociada al id de evaluación ${idEvaluacion}, error: ${error}`)
      throw new Error('Error al crear el evaluación:' + error.message)
    }
  }

  async createEvaluation (evaluationData, userData) {
    const userId = userData.get('id_info_usuario')
    const userName = userData.get('nombre')
    LOG.info(`Creando evaluación para el usuario ${userName}, con id: ${userId}`)
    let transaction
    const currentDate = new Date().toISOString()
    LOG.info(`El fecha actual al momento de crear una evaluacion es: ${currentDate}`)
    try {
      transaction = await sequelize.transaction()
      // const isActive = await this.isActive(evaluationData)

      const newEvaluation = await evaluation.create({
        nombre: evaluationData.title,
        subtitulo: evaluationData.subtitle,
        descripcion: evaluationData.description,
        retroalimentacion_activa: evaluationData.feedback,
        fecha_activacion: evaluationData.activationDate,
        hora_activacion: evaluationData.activationTime,
        duracion: evaluationData.duration,
        id_usuario: userId,
        id_dinamica: evaluationData.idDinamic,
        fecha_desactivacion: evaluationData.deactivationDate,
        hora_desactivacion: evaluationData.deactivationTime,
        fecha_creacion: currentDate,
        active: true // llamaremos al metodo is active
      }, { transaction })
      // await this.isActive2(evaluationData, userId)
      await transaction.commit()

      return { evaluation: newEvaluation }
    } catch (error) {
      LOG.error(`Ocurrio un error al crear la evaluación, error: ${error}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al crear el evaluación:' + error.message)
    }
  }

  async updateEvaluation (evaluationData, userData, idEvaluation) {
    const userId = userData.get('id_info_usuario')
    const userName = userData.get('nombre')
    LOG.info(`Actualizando evaluación para el usuario ${userName}, con id: ${userId}`)
    let transaction
    const currentDate = new Date().toISOString()
    LOG.info(`El fecha al momento de actualizar una evaluacion es: ${currentDate}`)
    try {
      const existEvaluation = await evaluation.findByPk(idEvaluation)

      if (!existEvaluation) {
        return { error: 'Not Found', statusCode: 404, message: 'La evaluación con el ID proporcionado no fue encontrada.' }
      }
      const originalUserId = existEvaluation.get('id_usuario')
      LOG.info(`El userId que hizo la evaluacion es: ${userId} y el usuario que la esta solicitando es: ${userId}`)
      if (originalUserId !== userId) {
        LOG.error('User id not have authorization to delete this evaluatión')
        return { error: 'Forbidden', statusCode: 403, message: 'No tienes autorización para borrar esta evaluación' }
      }

      transaction = await sequelize.transaction()
      // const isActive = await this.isActive(evaluationData)

      await existEvaluation.update({
        nombre: evaluationData.title,
        subtitulo: evaluationData.subtitle,
        descripcion: evaluationData.description,
        retroalimentacion_activa: evaluationData.feedback,
        fecha_activacion: evaluationData.activationDate,
        hora_activacion: evaluationData.activationTime,
        duracion: evaluationData.duration,
        id_usuario: userId,
        // id_dinamica: evaluationData.idDinamic,
        fecha_desactivacion: evaluationData.deactivationDate,
        hora_desactivacion: evaluationData.deactivationTime,
        fecha_creacion: currentDate,
        active: true // llamaremos al metodo is active
      }, { transaction })
      // await this.isActive2(evaluationData, userId)
      await transaction.commit()

      return { evaluation: existEvaluation }
    } catch (error) {
      LOG.error(`Ocurrio un error al crear la evaluación, error: ${error}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al crear el evaluación:' + error.message)
    }
  }

  async deleteEvaluation (evaluationId, reqUserId) {
    let transaction
    try {
      transaction = await sequelize.transaction()
      // Busca la entrada por su ID
      const existingEvaluation = await evaluation.findByPk(evaluationId, { transaction })
      if (!existingEvaluation) {
        return { error: 'Not Found', statusCode: 404, message: 'La evaluación con el ID proporcionado no fue encontrada.' }
      }
      const userId = existingEvaluation.get('id_usuario')
      LOG.info(`El userId que hizo la evaluacion es: ${userId} y el usuario que la esta solicitando es: ${reqUserId}`)
      if (userId !== reqUserId) {
        LOG.error('User id not have authorization to delete this evaluatión')
        return { error: 'Forbidden', statusCode: 403, message: 'No tienes autorización para borrar esta evaluación' }
      }
      // eliminar respuestas asociadas a la evaluacion
      await AnswersEvaluation.destroy({
        where: {
          id_evaluacion: evaluationId
        },
        transaction
      })

      // revisar si tiene preguntas asociadas a la evalucion, si la tiene se eliminan tambien
      const existingSentences = await sort.findAll({
        where: {
          id_evaluacion: evaluationId
        },
        transaction
      })

      if (existingSentences.length !== 0) {
        LOG.info('The evaluation have senteces into sort table')
        // eliminamos las oraciones dadas de alta
        await sort.destroy({
          where: {
            id_evaluacion: evaluationId
          },
          transaction
        })
        LOG.info('Sentences have been deleted from the sort table')
      }
      // revisando el tipo pregunta/respuesta
      const existingQuestion = await question.findAll({
        where: {
          id_evaluacion: evaluationId
        },
        transaction
      })
      if (existingQuestion.length !== 0) {
        LOG.info('The evaluation have senteces into question table')

        // obtengo los valores de idPregunta
        const idQuestion = existingQuestion.map(question => question.id_pregunta)
        // eliminar las respuestas dadas de alta
        for (const idQuestions of idQuestion) {
          await answer.destroy({
            where: {
              id_pregunta: idQuestions
            },
            transaction
          })
        }
        // eliminamos las preguntas dadas de alta
        await question.destroy({
          where: {
            id_evaluacion: evaluationId
          },
          transaction
        })
        LOG.info('Sentences have been deleted from the Q/A table')
      }

      // Elimina la entrada
      await existingEvaluation.destroy({ transaction })

      await transaction.commit()

      return { message: 'Evaluación eliminada exitosamente.' }
    } catch (error) {
      LOG.error(`Ocurrió un error al eliminar la evaluación, error: ${error}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al eliminar evaluación:' + error.message)
    }
  }

  async findEvaluation (evaluationData, userId) {
    try {
      const evaluationFound = await evaluation.findOne({
        where: {
          nombre: evaluationData.title,
          retroalimentacion_activa: evaluationData.feedback,
          duracion: evaluationData.duration,
          id_dinamica: evaluationData.idDinamic,
          id_usuario: userId
        }
      })
      return evaluationFound
    } catch (error) {
      LOG.error(`Ocurrio un error al buscar la evaluacion ${error.message}`)
    }
  }

  async updateEvaluationStatus (idEvaluation, status) {
    LOG.info(`Updating status of evaluation with id ${idEvaluation}`)
    let transaction
    try {
      transaction = await sequelize.transaction()
      const newEvaluation = await evaluation.update({
        active: status // llamaremos al metodo is active
      },
      {
        where: {
          id_evaluaciones: idEvaluation
        },
        transaction
      })

      await transaction.commit()
      LOG.info(`Evaluation had status active ${status} now and the info is: ${newEvaluation}`)
      return 'Evaluation status update correctly'
    } catch (error) {
      LOG.error(`Ocurrio un error al actualizar el estatus de la evaluacion ${error.message}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al eliminar evaluación:' + error.message)
    }
  }

  async isActive2 (evaluationData, userId) {
    // Hora actual
    const currentDate = new Date().toISOString()
    const options = { timeZone: TIMEZONE }
    const currentDateMexico = currentDate.toLocaleString('en-US', options)
    LOG.info(`la fecha actual es ${currentDateMexico}`)

    // hora configurada
    const evaluationFound = await this.findEvaluation(evaluationData, userId)
    const activationDate = evaluationFound.get('fecha_activacion')
    const hourActivation = evaluationFound.get('hora_activacion')
    const [hours, minutes] = hourActivation.split(':').map(Number)
    const activationDateISO = new Date(activationDate).toISOString()
    // activationDateISO.setHours(hours)
    // activationDateISO.setMinutes(minutes)
    const activationDateISOMexico = activationDateISO.toLocaleString('en-US', options)

    LOG.info(`fecha de activacion: ${activationDateISOMexico}`)
  }

  async isActive (evaluationData, userId) {
    try {
      // Data
      const currentDate = new Date()
      const options = { timeZone: TIMEZONE }
      const currentDateMexico = currentDate.toLocaleString('en-US', options)
      LOG.info(`la fecha actual es ${currentDateMexico}`)
      // LOG.info(`prueba ${currentDate.toISOString()}`)
      const actualHour = currentDate.getHours()
      const actualMinute = currentDate.getMinutes()
      // LOG.info(`la fecha actual es: ${currentDate.toISOString()}, la hora actual es ${actualHour}:${actualMinute}`)

      const activationDate = evaluationData.activationDate
      const activationTime = evaluationData.activationTime
      const dateActiveUTC = new Date(activationDate)
      const [hours, minutes] = activationTime.split(':').map(Number)
      dateActiveUTC.setHours(hours)
      dateActiveUTC.setMinutes(minutes)
      const dateActiveMexico = currentDate.toLocaleString('en-US', options)

      LOG.info(`fecha de activacion: ${dateActiveUTC}`)

      if (currentDateMexico >= dateActiveMexico) {
        LOG.info(`La fecha actual es mayor a la fecha configurada ${dateActiveUTC.getDate()}`)
        return true
      }
      LOG.info(`La fecha actual es menor a la fecha configurada ${dateActiveUTC.getDate()} y hora ${dateActiveUTC.getHours()}`)
      return false
      // LOG.info(`el activation date es ${activationDate} y el activation time es: ${activationTime} y las horas son: ${actualHour} minutos: ${actualMinute}`)
      // Convertir la fecha y hora proporcionadas en objetos Date
      /* const dateActive = new Date(activationDate).toISOString()

      // LOG.info(`la fecha actual es ${currentDate.toISOString()}, la fecha de activacion es ${dateActive} hours ${hours}, minutes ${minutes}`)
      // Comparar las fechas y horas

      if ((currentDate.toISOString() > dateActive)) {
        LOG.info('La fecha actual es mayor a la establecida')
        return true
      }
      if ((currentDate.toISOString() === dateActive)) {
        LOG.info('las fechas de activacion coinciden, se revisara la hora')
        if ((actualHour > hours)) {
          LOG.info('La hora actual es mayor a la establecida')
          return true
        } else if (actualHour === hours) {
          LOG.info('Las horas coinciden, se revisara el minuto')
          if (actualMinute >= minutes) {
            LOG.info('la fecha actual es mayor o igual a la fecha de activación')
            return true
          }
          return false
        }
      }
      LOG.info('The evaluation is not active')
      return false */
    } catch (error) {
      LOG.error(`Error en la función isActive: ${error.message}`)
      return false // En caso de error, se considera que la evaluación no está activa
    }
  }
}

module.exports = new CreateEvaluationService()
