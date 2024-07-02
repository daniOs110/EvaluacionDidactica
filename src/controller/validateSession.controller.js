const validateTokenRouter = require('express').Router()
const LOG = require('../app/logger')
const { verifyToken } = require('../helpers/handlerJwt')
const ErrorMessages = require('../utils/errorMessages')
const SuccesfullMessages = require('../utils/succesfullMessages')

validateTokenRouter.get('/session/validateToken/:token', async (req, res) => {
  const token = req.params.token
  const dataToken = await verifyToken(token)
  if (dataToken == null) {
    LOG.info('No exist a token id')
    return res.status(401).json({ message: ErrorMessages.NOT_SESSION })
  } else { res.status(200).json({ message: SuccesfullMessages.TOKEN_VALID }) }
})

module.exports = validateTokenRouter
