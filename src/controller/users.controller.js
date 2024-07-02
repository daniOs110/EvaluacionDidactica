const createUserRouter = require('express').Router()
const CreateAccountDTO = require('../dtos/user/create-user.dto')
const LoginDTO = require('../dtos/user/login.dto')
const EditAccountDTO = require('../dtos/user/edit-user.dto')
const userService = require('../service/user.service')
const { matchedData } = require('express-validator')
const { validateRegisterUser, validateLoginUser, validateUpdateUser, validateForgotPassword, validateResetPassword, validateGuestUser } = require('../validators/users.validator')
const ErrorMessages = require('../utils/errorMessages')
const authMiddleware = require('../middleware/session')
const LOG = require('../app/logger')
const { verifyToken } = require('../helpers/handlerJwt')

createUserRouter.use((req, res, next) => {
  LOG.info('Receive request:', req.method, req.url)
  next()
})

createUserRouter.post('/user/createAccount', validateRegisterUser, async (req, res) => {
  req = matchedData(req)
  res.send({ data: req })
  // res.send('receive post request') PRUEBA
})

createUserRouter.get('/user/guestScreen/:pin', async (req, res) => {
  try {
    const pin = req.params.pin
    if (pin === null || pin === '') {
      return res.status(400).json({ message: 'bad request not have a pin included' })
    }
    LOG.info(`El pin recibido desde los parametros es ${pin}`)
    return res.status(200).json({ pin })
  } catch (error) {
    LOG.error('Error mostrando pantalla de usuario invitado: ', error)
    return res.status(500).json({ message: ErrorMessages.SERVER_ERROR })
  }
})

createUserRouter.post('/user/guest', validateGuestUser, async (req, res) => {
  // const pin = req.body.pin
  try {
    LOG.info('llegaste al servicio usuario invitado')
    const userName = req.body.userName

    const guestUser = await userService.createGuestUser(userName)

    if (guestUser === null || guestUser === undefined) {
      return res.status(400).json({ message: ErrorMessages.GUEST_USER })
    }

    LOG.info(`El usuario ${userName} se creo correctamente`)
    return res.status(201).json({ guestUser })
  } catch (error) {
    LOG.error('Error creando el usuario invitado: ', error)
    return res.status(500).json({ message: ErrorMessages.SERVER_ERROR })
  }
  // esta debe redirigir a el servicio de unirse a evaluación
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
    return res.status(201).json(createUser)
    // res.send({ data: req })
  } catch (error) {
    LOG.error('Error creando el usuario: ', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

createUserRouter.post('/user/forgotPassword', validateForgotPassword, async (req, res) => {
  try {
    const validatedData = matchedData(req)
    const existUser = await userService.getUserByEmail(validatedData.email)
    if (!existUser) {
      return res.status(400).json({ message: ErrorMessages.USER_NOT_EXIST })
    }
    try {
      // intentar enviar correo de cambio de contraseña
      await userService.recoverPassword(existUser)
      return res.status(200).json({ message: 'correo enviado con exito' })
    } catch (error) {
      LOG.error('Error reseteando contraseña ', error)
      return res.status(500).json({ message: 'Internal server error' })
    }
  } catch (error) {

  }
})
createUserRouter.post('/user/newPassword/:token', validateResetPassword, async (req, res) => {
  const token = req.params.token

  const dataToken = await verifyToken(token)
  if (dataToken === null) {
    return res.status(500).send('Hubo un error al procesar la actualización de contraseña.')
  }

  LOG.info(`El token es ${token} y el dato verificado es: ${dataToken}`)
  const validatedData = matchedData(req)

  if (!dataToken._id) {
    LOG.info('No exist a token id')
    return res.status(401).json({ message: ErrorMessages.NOT_SESSION })
  }
  if (validatedData.password !== validatedData.confirmPassword) {
    return res.status(400).json({ message: ErrorMessages.PASSWORD_UNMATCH })
  }

  try {
    let userUpdate = false
    userUpdate = await userService.resetPassword(dataToken, validatedData)
    if (userUpdate) {
      return res.send('¡Tu contraseña se ha actualizado con exito!')
    }
    return res.send('¡Tu contraseña no se ha podido actualizar!')
  } catch (error) {
    LOG.error(error)
    return res.status(500).send('Hubo un error al procesar la actualización de contraseña.')
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
    return res.status(500).json({ message: 'internal server error' })
  }
})

createUserRouter.get('/user/confirmEmail/:token', async (req, res) => {
  const token = req.params.token
  const dataToken = await verifyToken(token)
  if (dataToken === null) {
    return res.status(500).send('Hubo un error al confirmar el email.')
  }
  if (!dataToken._id) {
    LOG.info('No exist a token id')
    return res.status(401).json({ message: ErrorMessages.NOT_SESSION })
  }
  try {
    await userService.verificateUser(dataToken)
    return res.send('¡Tu correo electrónico ha sido verificado con éxito!')
  } catch (error) {
    LOG.error(error)
    return res.status(500).send('Hubo un error al procesar la verificación del correo electrónico.')
  }
})
/***
 * to send an email verification
 */
createUserRouter.get('/user/sendConfirmationEmail', authMiddleware, async (req, res) => {
  const token = req.token
  const user = req.user
  try {
    await userService.sendConfirmationEmail(user.get('correo'), token)
    LOG.info('email enviado con exito')
    return res.send('¡Tu correo electrónico ha sido enviado con éxito!')
  } catch (error) {
    LOG.error(`error al enviar el correo electronico ${error}`)
    return res.status(500).send('Hubo un error al enviar el correo electrónico.')
  }
})

createUserRouter.get('/user/', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.query.email
    const user = await userService.getUserByEmail(userEmail)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    return res.status(200).json(user)
  } catch (error) {
    LOG.error('Error obteniendo la información del usuario por email: ', error)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
})

createUserRouter.post('/user/:id', authMiddleware, validateUpdateUser, async (req, res) => {
  try {
    const validatedData = matchedData(req)
    const id = req.params.id
    // const newEditAccountDTO = new EditAccountDTO(req.body.correo, req.body.nombre, req.body.apellidoPaterno, req.body.apellidoMaterno, req.body.verificado)
    const newEditAccountDTO = new EditAccountDTO(validatedData.correo, validatedData.nombre, validatedData.apellidoPaterno, validatedData.apellidoMaterno, validatedData.verificado)

    console.log('newEditAccountDTO: ', newEditAccountDTO)

    const updatedUser = await userService.updateUser(id, newEditAccountDTO)
    if (updatedUser === null) {
      return res.status(404).json({ message: 'Usuario no encontrado o no hay información para actualizar' })
    }
    return res.status(200).json({ message: 'usuario actualizado con exito' })
  } catch (error) {
    LOG.error('Error actualizando los datos del usuario: ', error)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
})

createUserRouter.get('/user', (req, res) => {
  return res.send('User crontroller')
})

module.exports = createUserRouter
