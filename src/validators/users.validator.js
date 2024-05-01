const { check } = require('express-validator')
const { validateResult } = require('../helpers/validate.helper')
const ErrorMessages = require('../utils/errorMessages')
const { REGEX_NAMES } = require('../utils/globalConstants')

const validateRegisterUser = [
  check('name').exists().notEmpty().custom(validateName).withMessage(ErrorMessages.NAME_REQUIRED),
  check('firstName').exists().notEmpty().custom(validateName).withMessage(ErrorMessages.FIRST_NAME_REQUIRED),
  check('lastName').optional().isString().custom(validateName).withMessage(ErrorMessages.LAST_NAME_REQUIRED),
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
  (req, res, next) => {
    return validateResult(req, res, next)
  }
]
const validateResetPassword = [
  check('password').exists().notEmpty().isLength({ min: 3, max: 15 }).withMessage(ErrorMessages.PASSWORD_FORMAT),
  check('confirmPassword').exists().notEmpty(),
  (req, res, next) => {
    return validateResult(req, res, next)
  }
]

const validateCreateEvaluation = [
  check('title').exists().notEmpty().isString().withMessage(ErrorMessages.TITLE_FORMAT),
  check('feedback').exists().notEmpty().isBoolean().withMessage(ErrorMessages.FEEDBACK_ERROR),
  check('activationDate').exists().isISO8601().toDate().withMessage(ErrorMessages.ACTIVATIONDATE_FORMAT),
  check('activationTime').exists().isString().withMessage(ErrorMessages.ACTIVATIONTIME_FORMAT),
  check('duration').exists().isString().withMessage(ErrorMessages.DURATION_FORMAT),
  check('idDinamic').exists().isString().withMessage(ErrorMessages.IDDINAMIC_FORMAT),
  check('creationDate').exists().isISO8601().toDate().withMessage(ErrorMessages.CREATIONDATE_FORMAT),
  (req, res, next) => {
    return validateResult(req, res, next)
  }
]

function validateName (value) {
  if (value && !REGEX_NAMES.test(value)) {
    throw new Error(ErrorMessages.FORMAT_NAMES)
  }
  return true
}

module.exports = { validateRegisterUser, validateLoginUser, validateForgotPassword, validateResetPassword, validateCreateEvaluation }
