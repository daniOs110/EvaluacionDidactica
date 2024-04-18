const express = require('express')
const router = express.Router()
const checkOrigin = require('../middleware/origin')
const { validateCreate } = require('../validators/users.validator')
const {createUser}

router.post('/', checkOrigin, validateCreate, createUser)