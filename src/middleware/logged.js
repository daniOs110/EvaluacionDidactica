const { verifyToken } = require('../helpers/handlerJwt')
const ErrorMessages = require('../utils/errorMessages')
const UserInfo = require('../model/schema/user.info.schema')
const GuestUser = require('../model/schema/guest.user.schema')
const LOG = require('../app/logger')
// const GUESTUSER = process.env.FRONTEND_GUEST_USER
// #FRONT-END URL
// FRONTEND_URL = 'http://localhost:8080/'
// redirigira a la url de la pantalla del front

const authTypeUserMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: ErrorMessages.NOT_SESSION })
    }
    const token = req.headers.authorization.split(' ').pop()
    const dataToken = await verifyToken(token)
    LOG.info(`dataToken register: ${dataToken._id}, data guest user: ${dataToken._idGuest}`)

    if (!dataToken._id && !dataToken._idGuest) {
      LOG.info('No exist a token id')
      return res.status(401).json({ message: ErrorMessages.NOT_SESSION })
    }
    let user = null
    let typeUser = null
    if (dataToken._id !== null && dataToken._id !== undefined) {
      user = await UserInfo.findByPk(dataToken._id)
      typeUser = 'REGISTER'
      LOG.info(`recover data from userInfo the type of user is ${typeUser}`)
    } else if (dataToken._idGuest !== null && dataToken._idGuest !== undefined) {
      user = await GuestUser.findByPk(dataToken._idGuest)
      typeUser = 'GUEST'
      LOG.info(`recover data from guestUser the type of user is ${typeUser}`)
    }
    req.user = user // para devolver los datos del usuario
    req.token = token // devolvemos el token
    req.type = typeUser
    next()
  } catch (error) {
    return res.status(401).json({ message: ErrorMessages.NOT_SESSION })
  }
}
// const areLoggedin = async (req, res, next) => {
//   const pin = req.body.pin
//   try {
//     LOG.info(`el pin es: ${pin}`)

//     if (!req.headers.authorization) {
//       // es usuario invido mandar bandera
//       LOG.info('No ha inciado sesion se redirige a registrar usuario invitado')
//       return res.redirect(`/lerner/user/guestScreen/${pin}`)
//     }
//     const token = req.headers.authorization.split(' ').pop()
//     const dataToken = await verifyToken(token)

//     if (!dataToken._id) {
//       LOG.info('No exist a token id')
//       return res.redirect(`/lerner/user/guestScreen/${pin}`)
//     }
//     const user = await UserInfo.findByPk(dataToken._id)
//     req.user = user // para devolver los datos del usuario
//     req.token = token // devolvemos el token
//     next()
//   } catch (error) {
//     LOG.info('No ha inciado sesion se redirige a registrar usuario invitado')
//     return res.redirect(`/lerner/user/guestScreen/${pin}`)
//   }
// }

module.exports = authTypeUserMiddleware
