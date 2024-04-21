const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

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
 * pasar el token de sesion JWT
 * @param {*} token
 * @returns
 */
const verifyToken = async (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (e) {
    return null
  }
}

const decodeSign = (token) => { // TODO: Verificar que el token sea valido y correcto
  return jwt.decode(token, null)
}

module.exports = { tokenSign, decodeSign, verifyToken }
