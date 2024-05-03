const evaluation = require('../model/schema/evaluation.schemas')
const dinamics = require('../model/schema/dinamic.schema')
const clasification = require('../model/schema/clasifications.schema')
const sequelize = require('../config/database')
// const { parseISO, format, isBefore, isEqual, parse } = require('date-fns')
const TIMEZONE = process.env.TIME_ZONE
const LOG = require('../app/logger')

class CreateEvaluationService {
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

  async finadAllEvaluations (userData) {
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

  async createEvaluation (evaluationData, userData) {
    const userId = userData.get('id_info_usuario')
    const userName = userData.get('nombre')
    LOG.info(`Creando evaluación para el usuario ${userName}, con id: ${userId}`)
    let transaction
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
        fecha_creacion: evaluationData.creationDate,
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
