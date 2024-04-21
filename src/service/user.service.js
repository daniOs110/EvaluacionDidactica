const userInfo = require('../model/schema/user.info.schema')
const userCredentials = require('../model/schema/user.crendentials.schema')
const sequelize = require('../config/database')
const { encrypt, compare } = require('../helpers/handler.bcrypt')
const UserInfo = require('../model/schema/user.info.schema')
const ErrorMessages = require('../utils/errorMessages')
const { tokenSign } = require('../helpers/handlerJwt')
const LOG = require('../app/logger')

class UserService {
  async createUser (userData) {
    let transaction

    try {
      transaction = await sequelize.transaction()

      const passwordHash = await encrypt(userData.password)

      const newCredentials = await userCredentials.create({
        hash_password: passwordHash,
        salt: '10',
        id_roles_de_usuario: 1
      }, { transaction })

      // await userInfo.sync()
      const newUser = await userInfo.create({
        nombre: userData.name,
        apellido_paterno: userData.firstName,
        apellido_materno: userData.lastName,
        correo: userData.email,
        verificado: false,
        id_usuario: newCredentials.id_credenciales_usuario
      }, { transaction })

      await transaction.commit()
      const token = await tokenSign(newUser, newCredentials)
      return { credentials: newCredentials, info: newUser, token }
    } catch (error) {
      LOG.error(error)
      if (transaction) await transaction.rollback()
      throw new Error('Error al crear el usuario:' + error.message)
    }
  }

  async login (userData) {
    try {
      LOG.info('verifying if the user and password match')
      const user = await userInfo.findOne({ where: { correo: userData.email } })
      const idCredential = user.get('id_usuario')
      const userCredentialData = await userCredentials.findOne({ where: { id_credenciales_usuario: idCredential } })
      const hashPassword = userCredentialData.get('hash_password')
      const check = await compare(userData.password, hashPassword)
      if (!check) {
        return false
      }

      const data = {
        token: await tokenSign(user, userCredentialData),
        user
      }
      return data
    } catch (error) {
      LOG.error(error)
    }
  }

  async getUserByEmail (email) {
    try {
      LOG.info('finding email in DB')
      const user = await UserInfo.findOne({ where: { correo: email } })
      return user
    } catch (error) {
      LOG.error(error)
      throw new Error(ErrorMessages.GET_USER_EMAIL)
    }
  }
}

module.exports = new UserService()
