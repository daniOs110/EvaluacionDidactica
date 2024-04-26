const { validationResult } = require('express-validator')
const LOG = require('../app/logger')

const validateResult = (req, res, next) => {
  try {
    validationResult(req).throw()
    return next()
  } catch (err) {
    LOG.error(err)
    res.status(400)
    res.send({ errors: err.array() })
  }
}

module.exports = { validateResult }
