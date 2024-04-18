const { check } = require('express-validator')
// const { validateResult } =

const validateCreateUser = [
  check('name').exists().not().isEmpty(),
  check('firstName').exists().not().isEmpty(),
  check('lastName').exists().not().isEmpty(),
  check('email').exists().isEmail().notEmpty,
  check('password').exists().notEmpty().isStrongPassword(),
  check('confirmPassword').exists().notEmpty(),
  (req, res, next) => {

  }
]

module.exports = { validateCreateUser }
