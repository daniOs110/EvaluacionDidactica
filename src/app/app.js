const express = require('express')
const router = require('../router/product.router')
const createUserRouter = require('../controller/users.controller')
const adminRouter = require('../controller/admin.controller')
const morgan = require('morgan')
const cors = require('cors')
const validateTokenRouter = require('../controller/validateSession.controller')
const createEvaluationRouter = require('../controller/createEvaluation.controller')
const orderQuestionRouter = require('../controller/orderQuestion.controller')
const useEvaluationRouter = require('../controller/useEvaluation.controller')
const evaluationAnswerRouter = require('../controller/evaluationAnswers.controller')
const questionAnswerRouter = require('../controller/questionAnswer.controller')

const whiteList = ['https://app-didactic-evaluations.web.app']

const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

const app = express()

app.use(morgan('dev'))
app.use(express.json())
// app.use(cors(corsOptions))
app.use(cors())

app.get('/', (req, res) => {
  res.send('This is express')
})
app.use(express.json())
app.use('/api/v1', router)
app.use('/lerner', createUserRouter, adminRouter, validateTokenRouter, createEvaluationRouter, orderQuestionRouter, useEvaluationRouter, evaluationAnswerRouter, questionAnswerRouter)

module.exports = app

// const express = require('express')
// const router = require('../router/product.router')
// const createUserRouter = require('../controller/users.controller')
// const adminRouter = require('../controller/admin.controller')
// const morgan = require('morgan')
// const cors = require('cors')
// const validateTokenRouter = require('../controller/validateSession.controller')
// const createEvaluationRouter = require('../controller/createEvaluation.controller')
// const orderQuestionRouter = require('../controller/orderQuestion.controller')
// const useEvaluationRouter = require('../controller/useEvaluation.controller')
// const evaluationAnswerRouter = require('../controller/evaluationAnswers.controller')

// const whiteList = ['https://app-didactic-evaluations.web.app']

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whiteList.indexOf(origin) !== -1 || !origin) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }
// const whiteList = ['https://app-didactic-evaluations.web.app']

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whiteList.indexOf(origin) !== -1 || !origin) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }

// const app = express()

// app.use(morgan('dev'))
// app.use(express.json())
// // app.use(cors(corsOptions))
// // app.use(cors())
// // app.use(cors(corsOptions))
// app.use(cors());

// app.get('/', (req, res) => {
//   res.send('This is express')
// })
// app.use(express.json())
// app.use('/api/v1', router)
// app.use('/lerner', createUserRouter, adminRouter, validateTokenRouter, createEvaluationRouter, orderQuestionRouter, useEvaluationRouter, evaluationAnswerRouter)

// module.exports = app
