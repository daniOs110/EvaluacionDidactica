const evaluationAnswerRouter = require('express').Router()
const LOG = require('../app/logger')
const authMiddleware = require('../middleware/session')
const authTypeUserMiddleware = require('../middleware/logged')
const EvaluationService = require('../service/evaluation.service')
const createEvaluationService = require('../service/createEvaluation.service')
const orderQuestionService = require('../service/dinamics/sorter/orderQuestion.service')

evaluationAnswerRouter.post('/evaluation/answer/sortSentence', authTypeUserMiddleware, async (req, res) => {
  const user = req.user
  const typeUser = req.type
})
