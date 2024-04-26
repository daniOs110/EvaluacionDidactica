const express = require('express')
const router = express.Router()
const checkOrigin = require('../middleware/origin')
const { validateCreate } = require('../validators/users.validator')
const { createUser } = require('')

router.post('/', checkOrigin, validateCreate, createUser)

module.exports = router
