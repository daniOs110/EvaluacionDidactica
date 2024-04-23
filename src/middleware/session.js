const { verifyToken } = require('../helpers/handlerJwt')
const ErrorMessages = require('../utils/errorMessages')
const UserInfo = require('../model/schema/user.info.schema')
const LOG = require('../app/logger')

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: ErrorMessages.NOT_SESSION })
    }
    const token = req.headers.authorization.split(' ').pop()
    const dataToken = await verifyToken(token)

    if (!dataToken._id) {
      LOG.info('No exist a token id')
      return res.status(401).json({ message: ErrorMessages.NOT_SESSION })
    }
    const user = await UserInfo.findByPk(dataToken._id)
    req.user = user // para devolver los datos del usuario
    req.token = token // devolvemos el token
    next()
  } catch (error) {
    return res.status(401).json({ message: ErrorMessages.NOT_SESSION })
  }
}

module.exports = authMiddleware
