const Question = require('../../../model/schema/questions.schema')
const AnswerOption = require('../../../model/schema/response.schema')
const sequelize = require('../../../config/database')

const LOG = require('../../../app/logger')
// const Sorting = require('../../../model/schema/sorting.schema')
// const Answers = require('../../../model/schema/evaluation.results.schema')

class QuestionAnswerService {
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
}

module.exports = new QuestionAnswerService()
