const { config } = require('dotenv')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET
const LOG = require('../app/logger')

/**
 * Debes pasar el objeto del usuario
 * @param {*} user
 * @returns
 */
const tokenSign = async (userInfo, userCredentials) => {
  const sign = jwt.sign(
    {
      _id: userInfo.id_info_usuario,
      role: userCredentials.id_roles_de_usuario
    },
    JWT_SECRET,
    {
      expiresIn: '2h'
    }
  )
  return sign
}

/**
 * Debes pasar el objeto del usuario invitado
 * @param {*} user
 * @returns
 */
const tokenSignGuest = async (guestUser) => {
  const sign = jwt.sign(
    {
      _id: guestUser.id_usuarios_invitados,
      role: guestUser.id_roles_de_usuario_invitado
    },
    JWT_SECRET,
    {
      expiresIn: '4h'
    }
  )
  return sign
}

/**
 * pasar el token de sesion JWT
 * @param {*} token
 * @returns
 */
const verifyToken = async (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    LOG.error(`no se pudo verificar el token ${error}`)
    return null
  }
}

/**
 * Se debe ingresar un token valido
 * @param {*} token
 * @returns
 */
const decodeSign = (token) => { // TODO: Verificar que el token sea valido y correcto
  return jwt.decode(token, null)
}

/**
 * recuperar contraseña jwt
 */
const recoverToken = async (userInfo, userCredentials) => {
  try {
    const signRecover = jwt.sign({
      _id: userInfo.id_info_usuario,
      role: userCredentials.id_roles_de_usuario
    },
    JWT_SECRET,
    {
      expiresIn: '10m'
    }
    )
    return signRecover
  } catch (error) {
    LOG.error(error)
    return null
  }
}

module.exports = { tokenSign, decodeSign, verifyToken, recoverToken, tokenSignGuest }
