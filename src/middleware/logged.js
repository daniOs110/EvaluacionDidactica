const { verifyToken } = require('../helpers/handlerJwt')
const ErrorMessages = require('../utils/errorMessages')
const UserInfo = require('../model/schema/user.info.schema')
const LOG = require('../app/logger')

const areLoggedin = async (req, res, next) => {
  const pin = req.body.pin
  try {
    LOG.info(`el pin es: ${pin}`)

    if (!req.headers.authorization) {
      // es usuario invido mandar bandera
      LOG.info('No ha inciado sesion se redirige a registrar usuario invitado')
      return res.redirect(`/lerner/user/guestScreen/${pin}`)
    }
    const token = req.headers.authorization.split(' ').pop()
    const dataToken = await verifyToken(token)

    if (!dataToken._id) {
      LOG.info('No exist a token id')
      return res.redirect(`/lerner/user/guestScreen/${pin}`)
    }
    const user = await UserInfo.findByPk(dataToken._id)
    req.user = user // para devolver los datos del usuario
    req.token = token // devolvemos el token
    next()
  } catch (error) {
    LOG.info('No ha inciado sesion se redirige a registrar usuario invitado')
    return res.redirect(`/lerner/user/guestScreen/${pin}`)
  }
}

module.exports = areLoggedin
