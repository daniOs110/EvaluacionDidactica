const createUserRouter = require('express').Router()
const CreateAccountDTO = require('../dtos/user/create-user.dto')
const LoginDTO = require('../dtos/user/login.dto')
const userService = require('../service/user.service')
const { matchedData } = require('express-validator')
const { validateRegisterUser, validateLoginUser } = require('../validators/users.validator')
const ErrorMessages = require('../utils/errorMessages')
const authMiddleware = require('../middleware/session')
const LOG = require('../app/logger')

createUserRouter.use((req, res, next) => {
  LOG.info('Receive request:', req.method, req.url)
  next()
})

createUserRouter.post('/user/createAccount', validateRegisterUser, async (req, res) => {
  req = matchedData(req)
  res.send({ data: req })
  // res.send('receive post request') PRUEBA
})

createUserRouter.post('/user/signup', validateRegisterUser, async (req, res) => {
  try {
    const validatedData = matchedData(req)
    const existingUser = await userService.getUserByEmail(validatedData.email)
    if (existingUser) {
      return res.status(400).json({ message: ErrorMessages.EMAIL_EXIST })
    }

    if (validatedData.password !== validatedData.confirmPassword) {
      return res.status(400).json({ message: ErrorMessages.PASSWORD_UNMATCH })
    }
    const newUserDTO = new CreateAccountDTO(validatedData.name, validatedData.firstName, validatedData.lastName, validatedData.email, validatedData.password, validatedData.confirmPassword)

    const createUser = await userService.createUser(newUserDTO)
    res.status(201).json(createUser)
    // res.send({ data: req })
  } catch (error) {
    LOG.error('Error creando el usuario: ', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

createUserRouter.post('/user/login', validateLoginUser, async (req, res) => {
  try {
    const validatedData = matchedData(req)
    const newLogDto = new LoginDTO(validatedData.email, validatedData.password)
    const user = await userService.getUserByEmail(validatedData.email)
    LOG.info(`verify if the user exist for email ${validatedData.email}`)
    if (!user) {
      LOG.info('not exist the user')
      return res.status(404).json({ message: ErrorMessages.LOGIN_FAIL })
    }

    const login = await userService.login(newLogDto)
    if (!login) {
      LOG.error('wrong password')
      return res.status(401).json({ message: ErrorMessages.LOGIN_FAIL })
    }
    res.status(200).json(login)
  } catch (error) {
    console.error('Error al iniciar sesion: ', error)
    res.status(500).json({ message: 'internal server error' })
  }
})

createUserRouter.get('/user', (req, res) => {
  res.send('User crontroller')
})

module.exports = createUserRouter
