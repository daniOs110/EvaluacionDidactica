const { check } = require('express-validator')
const { validateResult } = require('../helpers/validate.helper')
const ErrorMessages = require('../utils/errorMessages')

const validateRegisterUser = [
  check('name').exists().notEmpty().isAlpha().withMessage(ErrorMessages.NAME_REQUIRED),
  check('firstName').exists().notEmpty().isAlpha().withMessage(ErrorMessages.FIRST_NAME_REQUIRED),
  check('lastName').isAlpha().withMessage(ErrorMessages.LAST_NAME_REQUIRED),
  check('email').exists().isEmail().notEmpty().withMessage(ErrorMessages.EMAIL_INVALID),
  check('password').exists().notEmpty().isLength({ min: 3, max: 15 }).withMessage(ErrorMessages.PASSWORD_FORMAT),
  check('confirmPassword').exists().notEmpty(),
  (req, res, next) => {
    return validateResult(req, res, next)
  }
]
const validateLoginUser = [
  check('email').exists().isEmail().notEmpty().withMessage(ErrorMessages.EMAIL_INVALID),
  check('password').exists().notEmpty().isLength({ min: 3, max: 15 }),
  (req, res, next) => {
    return validateResult(req, res, next)
  }
]
const validateForgotPassword = [
  check('email').exists().isEmail().notEmpty().withMessage(ErrorMessages.EMAIL_INVALID),
  check('password').exists().notEmpty().isLength({ min: 3, max: 15 }),
  check('confirmPassword').exists().notEmpty(),
  (req, res, next) => {
    return validateResult(req, res, next)
  }
]

module.exports = { validateRegisterUser, validateLoginUser, validateForgotPassword }
