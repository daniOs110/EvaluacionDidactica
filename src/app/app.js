const express = require('express')
const router = require('../router/product.router')
const createUserRouter = require('../controller/users.controller')
const morgan = require('morgan')

const app = express()

app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('This is express')
})
app.use(express.json())
app.use('/api/v1', router)
app.use('/lerner', createUserRouter)

module.exports = app
