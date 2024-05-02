const express = require('express')
const router = require('../router/product.router')
const createUserRouter = require('../controller/users.controller')
const morgan = require('morgan')
const cors = require('cors')
const validateTokenRouter = require('../controller/validateSession.controller')
const createEvaluationRouter = require('../controller/createEvaluation.controller')
const orderQuestionRouter = require('../controller/orderQuestion.controller')

const whiteList = ['http://localhost:3000']

const app = express()

app.use(morgan('dev'))
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('This is express')
})
app.use(express.json())
app.use('/api/v1', router)
app.use('/lerner', createUserRouter, validateTokenRouter, createEvaluationRouter, orderQuestionRouter)

module.exports = app
