const Question = require('../../../model/schema/questions.schema')
const AnswerOption = require('../../../model/schema/response.schema')
const Board = require('../../../model/schema/board.schema')
const PositionBoard = require('../../../model/schema/positionCrosswords.schema')
const Answers = require('../../../model/schema/evaluation.results.schema')
const Value = require('../../../model/schema/value.schema')
const sequelize = require('../../../config/database')

const LOG = require('../../../app/logger')
// const Sorting = require('../../../model/schema/sorting.schema')
// const Answers = require('../../../model/schema/evaluation.results.schema')

class QuestionAnswerService {
  constructor () {
    this.resultQuestionAnswerEvaluation = []
  }

  async saveGrid (idEvaluation, gridCols, gridRows) {
    let transaction
    try {
      transaction = await sequelize.transaction()
      LOG.debug(`Los datos a guardar son columna: ${gridCols} y fila: ${gridRows}`)
      const [existingBoard, created] = await Board.findOrCreate({
        where: {
          id_evaluacion: idEvaluation
        },
        defaults: {
          id_evaluacion: idEvaluation,
          columna: gridCols,
          fila: gridRows
        },
        transaction
      })
      if (!created) {
        LOG.info('palabra previamente creada, se actualizo')
        existingBoard.columna = gridCols
        existingBoard.fila = gridRows
        await existingBoard.save({ transaction })
      }

      await transaction.commit()
      return { board: existingBoard }
    } catch (error) {
      LOG.error(`Ocurrio un error al guardar datos del tablero, error: ${error.message}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al agregar pregunta a la evaluación:' + error.message)
    }
  }

  async addWord (idEvaluation, idWord, word) {
    let transaction
    try {
      transaction = await sequelize.transaction()
      LOG.debug(`Los datos a guardar son id palabra: ${idWord} y la palabra es: ${word}`)
      const [existingWord, created] = await Question.findOrCreate({
        where: {
          id_evaluacion: idEvaluation,
          num_pregunta: idWord
        },
        defaults: {
          pregunta: word,
          id_evaluacion: idEvaluation,
          num_pregunta: idWord,
          numero_respuestas: 0
        },
        transaction
      })
      if (!created) {
        LOG.info('palabra previamente creada, se actualizo')
        existingWord.pregunta = word
        await existingWord.save({ transaction })
      }

      await transaction.commit()
      return { word: existingWord }
    } catch (error) {
      LOG.error(`Ocurrio un error al agregar la pregunta a la evaluacion, error: ${error}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al agregar pregunta a la evaluación:' + error.message)
    }
  }

  async addQuestion (idEvaluation, questionText, numAnswers, idQuestion) {
    let transaction
    try {
      transaction = await sequelize.transaction()
      LOG.info(`la data a guardar es idEvaluacion: ${idEvaluation}, pregunta: ${questionText}, numero de Preguntas: ${numAnswers} id pregunta: ${idQuestion}`)
      const [existingQuestion, created] = await Question.findOrCreate({
        where: {
          id_evaluacion: idEvaluation,
          num_pregunta: idQuestion
        },
        defaults: {
          pregunta: questionText,
          id_evaluacion: idEvaluation,
          num_pregunta: idQuestion,
          numero_respuestas: numAnswers
        },
        transaction
      })
      if (!created) {
        LOG.info('oración previamente creada, se actualizo')
        existingQuestion.pregunta = questionText
        await existingQuestion.save({ transaction })
      }

      await transaction.commit()
      return { question: existingQuestion }
    } catch (error) {
      LOG.error(`Ocurrio un error al agregar la pregunta a la evaluacion, error: ${error}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al agregar pregunta a la evaluación:' + error.message)
    }
  }

  async addBoardAnswers (idQuestion, textAnswer, orientation, startX, startY) {
    let transaction
    try {
      transaction = await sequelize.transaction()
      LOG.info(`la data a guardar es idPregunta asociada: ${idQuestion}, texto pregunta: ${textAnswer}, orientacion: ${orientation} posicion eje x: ${startX}, posision eje y ${startY}`)
      const [existingAnswer, created] = await PositionBoard.findOrCreate({
        where: {
          id_pregunta: idQuestion
        },
        defaults: {
          respuesta_texto: textAnswer,
          orientacion: orientation,
          inicio_x: startX,
          inicio_y: startY
        },
        transaction
      })
      if (!created) {
        LOG.info('opcionde respuesta previamente creada, se actualizo')
        existingAnswer.respuesta_texto = textAnswer
        existingAnswer.orientacion = orientation
        existingAnswer.inicio_x = startX
        existingAnswer.inicio_y = startY
        await existingAnswer.save({ transaction })
      }

      await transaction.commit()
      return { answer: existingAnswer }
    } catch (error) {
      LOG.error(`Ocurrio un error al agregar la opcion de respuesta a la evaluacion, error: ${error}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al agregar opcion de pregunta a la evaluación:' + error.message)
    }
  }

  async addOptionAnswers (idQuestionSaved, textAnswer, status, idOption) {
    let transaction
    try {
      transaction = await sequelize.transaction()
      LOG.info(`la data a guardar es idPregunta asociada: ${idQuestionSaved}, texto pregunta: ${textAnswer}, status: ${status} id opcion respuesta: ${idOption}`)
      const [existingAnswer, created] = await AnswerOption.findOrCreate({
        where: {
          id_pregunta: idQuestionSaved,
          id_opcion: idOption
        },
        defaults: {
          opcion_respuesta_texto: textAnswer,
          status_respuesta: status,
          id_opcion: idOption
        },
        transaction
      })
      if (!created) {
        LOG.info('opcionde respuesta previamente creada, se actualizo')
        existingAnswer.opcion_respuesta_texto = textAnswer
        existingAnswer.status_respuesta = status
        await existingAnswer.save({ transaction })
      }

      await transaction.commit()
      return { answer: existingAnswer }
    } catch (error) {
      LOG.error(`Ocurrio un error al agregar la opcion de respuesta a la evaluacion, error: ${error}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al agregar opcion de pregunta a la evaluación:' + error.message)
    }
  }

  async getCrosswordEvaluation (idEvaluation) {
    this.resultQuestionAnswerEvaluation = []
    try {
      LOG.info(`El id de evaluacion es: ${idEvaluation}`)
      // Buscar datos de tablero
      const questions = await Question.findAll({
        where: {
          id_evaluacion: idEvaluation
        }
      })
      LOG.info(`the id evaluation is ${idEvaluation} and the num question: ${questions.length}`)
      if (questions.length === 0) {
        LOG.info(`No se encontraron preguntas asociadas a la evaluación: ${idEvaluation}`)
        return null
      }

      for (const question of questions) {
        const idQuestion = question.id_pregunta
        const numQuestion = question.num_pregunta
        const questionText = question.pregunta
        const answers = []
        LOG.info(`the id question is ${idQuestion} and the num question: ${numQuestion}`)
        // buscar en la tabla de respuestas las opciones asociadas al id_pregunta
        const answersPositions = await PositionBoard.findAll({
          where: {
            id_pregunta: idQuestion
          }
        })
        LOG.debug(`answer position array length is ${answersPositions.length}`)
        if (answersPositions.length > 0) {
          for (const answerPosition of answersPositions) {
            const answer = answerPosition.respuesta_texto
            const orientation = answerPosition.orientacion
            const startX = answerPosition.inicio_x
            const startY = answerPosition.inicio_y
            LOG.debug(`La respuesta es: ${answer}`)
            const respuesta = {
              answer,
              orientation,
              startX,
              startY
            }
            answers.push(respuesta)
          }
        } else {
          LOG.info(`No se encontraron respuestas asociadas a la evaluación: ${idEvaluation}`)
          return null
        }
        LOG.info('Llenando preguntas en la evaluacion')
        const preguntas = {
          idQuestionDb: idQuestion,
          clue: questionText,
          position: numQuestion,
          answers

        }
        this.resultQuestionAnswerEvaluation.push(preguntas)
      }
      return this.resultQuestionAnswerEvaluation.sort((a, b) => a.position - b.position)
    } catch (error) {
      // Manejar errores
      LOG.error('Error al obtener los datos de la evaluación para dinamica de crucigrama:', error)
      throw new Error('Error al obtener la informacion de la evaluación')
    }
  }

  async getQuestionAnswerEvaluation (idEvaluation) {
    this.resultQuestionAnswerEvaluation = []
    try {
      LOG.info(`El id de evaluacion es: ${idEvaluation}`)
      // Buscar datos de tabla preguntas
      const questions = await Question.findAll({
        where: {
          id_evaluacion: idEvaluation
        }
      })
      if (questions.length === 0) {
        LOG.info(`No se encontraron preguntas asociadas a la evaluación: ${idEvaluation}`)
        return null
      }

      for (const question of questions) {
        const idQuestion = question.id_pregunta
        const numQuestion = question.num_pregunta
        const questionText = question.pregunta
        const numAnswers = question.numero_respuestas
        const respuestas = []
        LOG.info(`the id question is ${numQuestion}`)
        // buscar en la tabla de respuestas las opciones asociadas al id_pregunta
        const answers = await AnswerOption.findAll({
          where: {
            id_pregunta: idQuestion
          }
        })
        if (answers.length > 0) {
          for (const answer of answers) {
            const optionId = answer.id_opcion
            const answerText = answer.opcion_respuesta_texto
            const status = answer.status_respuesta
            LOG.debug(`El id de la opcion es ${optionId} y la respuesta: ${answerText}`)
            const respuesta = {
              idOpcion: optionId,
              texto: answerText,
              correcta: status
            }
            respuestas.push(respuesta)
          }
        } else {
          LOG.info(`No se encontraron respuestas asociadas a la evaluación: ${idEvaluation}`)
          return null
        }
        LOG.info('Llenando preguntas en la evaluacion')
        const preguntas = {
          idQuestionDb: idQuestion,
          idPregunta: numQuestion,
          pregunta: questionText,
          numeroRespuestas: numAnswers,
          respuestas
        }
        this.resultQuestionAnswerEvaluation.push(preguntas)
      }
      return this.resultQuestionAnswerEvaluation.sort((a, b) => a.idPregunta - b.idPregunta)
    } catch (error) {
      // Manejar errores
      LOG.error('Error al obtener los datos de la evaluación para dinamica de opcion multiple:', error)
      throw new Error('Error al obtener la informacion de la evaluación')
    }
  }

  async getBoardData (idEvaluation) {
    try {
      const board = await Board.findOne({
        where: {
          id_evaluacion: idEvaluation
        }
      })
      if (!board) {
        LOG.info(`No se encontraron datos de tablero asociados a la evaluación: ${idEvaluation}`)
        return { error: 'Error finding boardData', statusCode: 404, message: 'not found board data asociated with de evaluation id' }
      }
      return board
    } catch (error) {
      LOG.error(`Error al obtener los datos de tablero asociados a la evaluación: ${error.message}`)
      throw new Error('Error al obtener los datos de tablero asociados a la evaluación')
    }
  }

  async getWordSearchEvaluation (idEvaluacion) {
    try {
      LOG.info(`El id de evaluacion es: ${idEvaluacion}`)
      // Buscar datos de tablero
      const board = await this.getBoardData(idEvaluacion)

      // Buscar todas las oraciones que pertenecen a la evaluación con el id dado
      const words = await Question.findAll({
        where: {
          id_evaluacion: idEvaluacion
        }
      })
      if (words.length === 0) {
        LOG.info('No se encontraron palabras para la evaluación:', idEvaluacion)
        return null
      }
      // Crear un objeto para almacenar el par clave-valor (numPregunta - oracion)
      const sentencesMap = new Map()

      // Iterar sobre las oraciones encontradas y almacenarlas en el objeto
      words.forEach(sentence => {
        LOG.info(`Guardando la pregunta ${sentence.num_pregunta}, con el valor ${sentence.pregunta}`)
        sentencesMap.set(sentence.num_pregunta, sentence.pregunta)
      })

      LOG.info('Transformando el mapa a respuesta json')

      const jsonObject = {}
      for (const [clave, valor] of sentencesMap) {
        jsonObject[clave] = valor
      }

      // const jsonString = JSON.stringify(jsonObject)
      return { boardData: board, words: jsonObject }
    } catch (error) {
      // Manejar errores
      LOG.error('Error al obtener los datos de la evaluación para sopa de letras:', error)
      throw new Error('Error al obtener la informacion de la evaluación')
    }
  }

  async deleteAnswer (idEvaluation, numQuestion, idOption) {
    let transaction
    try {
      transaction = await sequelize.transaction()
      // Busca la entrada por su ID
      const existingQuestion = await Question.findOne({
        attributes: ['id_pregunta'],
        where: {
          id_evaluacion: idEvaluation,
          num_pregunta: numQuestion
        }
      }, { transaction })

      if (!existingQuestion) {
        return { error: 'Not found', statusCode: 404, message: 'La pregunta con el numero de pregunta proporcionado no fue encontrada.' }
      }
      // Obtiene los id_pregunta de todas las entradas encontradas
      const idQuestion = existingQuestion.id_pregunta

      const existingAnswer = await AnswerOption.findOne({
        attributes: ['id_respuesta'],
        where: {
          id_pregunta: idQuestion,
          id_opcion: idOption
        }
      }, { transaction })

      if (!existingAnswer) {
        return { error: 'Not found', statusCode: 404, message: 'La pregunta con el numero de pregunta proporcionado no fue encontrada.' }
      }
      // Obtiene los id_pregunta de todas las entradas encontradas
      const idAnswer = existingAnswer.id_respuesta
      // Extrae el valor del id_ordenamiento
      LOG.info(`El id de pregunta a eliminar es es ${idAnswer}`)

      // Elimina la entrada utilizando el id_ordenamiento
      await AnswerOption.destroy({
        where: {
          id_respuesta: idAnswer
        },
        transaction
      })
      await transaction.commit()

      return { message: 'opcion de respuesta eliminada exitosamente.' }
    } catch (error) {
      LOG.error(`Ocurrió un error al eliminar la opcion de respuesta, error: ${error.message}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al eliminar la pregunta:' + error.message)
    }
  }

  async deleteAnswerCrossword (idEvaluation, numQuestion) {
    let transaction
    try {
      transaction = await sequelize.transaction()
      // Busca la entrada por su ID
      const existingQuestion = await Question.findOne({
        attributes: ['id_pregunta'],
        where: {
          id_evaluacion: idEvaluation,
          num_pregunta: numQuestion
        }
      }, { transaction })

      if (!existingQuestion) {
        return { error: 'Not found', statusCode: 404, message: 'La pregunta con el numero de pregunta proporcionado no fue encontrada.' }
      }
      // Obtiene los id_pregunta de todas las entradas encontradas
      const idQuestion = existingQuestion.id_pregunta

      const existingAnswer = await PositionBoard.findOne({
        attributes: ['id_posicion_crucigrama'],
        where: {
          id_pregunta: idQuestion
        }
      }, { transaction })

      if (!existingAnswer) {
        return { error: 'Not found', statusCode: 404, message: 'La respuesta con el numero de pregunta proporcionado no fue encontrada.' }
      }
      // Obtiene los id_pregunta de todas las entradas encontradas
      const idAnswer = existingAnswer.id_posicion_crucigrama
      // Extrae el valor del id_ordenamiento
      LOG.info(`El id de pregunta a eliminar es es ${idAnswer}`)

      // Elimina la entrada utilizando el id_ordenamiento
      await PositionBoard.destroy({
        where: {
          id_posicion_crucigrama: idAnswer
        },
        transaction
      })
      await transaction.commit()

      return { message: 'opcion de respuesta crucigrama eliminada exitosamente.' }
    } catch (error) {
      LOG.error(`Ocurrió un error al eliminar la opcion de respuesta, error: ${error.message}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al eliminar la pregunta:' + error.message)
    }
  }

  async deleteQuestion (idEvaluation, numQuestion) {
    let transaction
    try {
      transaction = await sequelize.transaction()
      // Busca la entrada por su ID
      const existingQuestion = await Question.findOne({
        attributes: ['id_pregunta'],
        where: {
          id_evaluacion: idEvaluation,
          num_pregunta: numQuestion
        }
      }, { transaction })

      if (!existingQuestion) {
        return { error: 'Not found', statusCode: 404, message: 'La pregunta con el numero de pregunta proporcionado no fue encontrada.' }
      }
      // Obtiene los id_pregunta de todas las entradas encontradas
      const idQuestion = existingQuestion.id_pregunta

      // Extrae el valor del id_ordenamiento
      LOG.info(`El id de pregunta a eliminar es es ${idQuestion}`)

      // Elimina la entrada utilizando el id_ordenamiento
      await Answers.destroy({
        where: {
          id_pregunta: idQuestion
        },
        transaction
      })
      await PositionBoard.destroy({
        where: {
          id_pregunta: idQuestion
        },
        transaction
      })
      await Value.destroy({
        where: {
          id_pregunta: idQuestion
        },
        transaction
      })
      await AnswerOption.destroy({
        where: {
          id_pregunta: idQuestion
        },
        transaction
      })

      // Elimina todas las entradas encontradas en sorting
      await Question.destroy({
        where: {
          id_pregunta: idQuestion
        },
        transaction
      })

      // confirma la transaccion
      await transaction.commit()

      return { message: 'pregunta eliminada exitosamente.' }
    } catch (error) {
      LOG.error(`Ocurrió un error al eliminar la pregunta, error: ${error}`)
      if (transaction) await transaction.rollback()
      throw new Error('Error al eliminar la pregunta:' + error.message)
    }
  }
}

module.exports = new QuestionAnswerService()
