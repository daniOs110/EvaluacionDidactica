const userInfo = require('../model/schema/user.info.schema')
const userCredentials = require('../model/schema/user.crendentials.schema')
const sequelize = require('../config/database')
const { encrypt, compare } = require('../helpers/handler.bcrypt')
const UserInfo = require('../model/schema/user.info.schema')
const ErrorMessages = require('../utils/errorMessages')
const { tokenSign, recoverToken } = require('../helpers/handlerJwt')
const LOG = require('../app/logger')
const { transport } = require('../app/mail')
const { URL_RESET_PASSWORD } = require('../utils/globalConstants')
const CONFIRM_EMAIL = process.env.CONFIRM_EMAIL

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
      try {
        await this.sendConfirmationEmail(userData.email, token)
        LOG.info('correo enviado con exito')
      } catch (error) {
        LOG.error(`No fue posible enviar el correo de confirmación, error: ${error}`)
      }

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

  async recoverPassword (user) {
  //  const user = await userInfo.findOne({ where: { correo: email } })
    const idCredential = user.get('id_info_usuario')
    const userCredentialData = await userCredentials.findOne({ where: { id_credenciales_usuario: idCredential } })
    const token = tokenSign(user, userCredentialData)
    LOG.info(token)
    const verificationLink = URL_RESET_PASSWORD + `${token}`
    await this.sendResetPasswordEmail(user.get('correo'), verificationLink)
    return null
  }

  async sendResetPasswordEmail (email, verificationLink) {
    try {
      await transport.sendMail({
        from: '"reset password email 👻" <lernerapp2024@gmail.com>',
        to: email,
        subject: 'reset password email ✔',
        html: `<p>Por favor, haz clic en el siguiente enlace para confirmar tu correo electrónico:</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>`

      })
      LOG.info(`Se envio el email a la siguiente ruta: ${verificationLink} `)
    } catch (error) {
      LOG.error(error)
      return null
    }
  }

  async sendConfirmationEmail (email, token) {
    try {
      const confirmationUrl = CONFIRM_EMAIL + `${token}`
      await transport.sendMail({
        from: '"Confirm email 👻" <lernerapp2024@gmail.com>',
        to: email,
        subject: 'Confirm email ✔',
        html: `<p>Por favor, haz clic en el siguiente enlace para confirmar tu correo electrónico:</p>
            <p><a href="${confirmationUrl}">${confirmationUrl}</a></p>`

      })
      LOG.info(`Se envio el email a la siguiente ruta: ${confirmationUrl} `)
    } catch (error) {
      LOG.error(error)
      return null
    }
  }

  async verificateUser (dataToken) {
    try {
      await UserInfo.update({ verificado: true }, { where: { id_info_usuario: dataToken._id } })
    } catch (error) {
      LOG.error(error)
      return null
    }
  }

  async resetPassword (user) {
    // enviamos el email que redirigira a la ruta de resetear contraseña

  }
}

module.exports = new UserService()
