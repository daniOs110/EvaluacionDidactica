const userInfo = require('../model/schema/user.info.schema')
const userCredentials = require('../model/schema/user.crendentials.schema')
const sequelize = require('../config/database')
const { encrypt, compare } = require('../helpers/handler.bcrypt')
const UserInfo = require('../model/schema/user.info.schema')
const ErrorMessages = require('../utils/errorMessages')
const { tokenSign, recoverToken } = require('../helpers/handlerJwt')
const LOG = require('../app/logger')
const { transport } = require('../app/mail')
const CONFIRM_EMAIL = process.env.FRONTEND_CONFIRM_EMAIL
const RESET_PASSWORD_EMAIL = process.env.FRONTEND_RESET_PASSWORD

// --- En el archivo .env se deben agregar las siguientes direcciones ---
// #FRONT-END URL
// FRONTEND_URL = 'http://localhost:8080/'
// FRONTEND_CONFIRM_EMAIL = 'http://localhost:8080/confirm-email/'
// FRONTEND_RESET_PASSWORD = 'http://localhost:8080/user/reset-password/'

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
    const token = await tokenSign(user, userCredentialData)
    try {
      await this.sendResetPasswordEmail(user.get('correo'), token)
    } catch (error) {
      return null
    }
  }

  async sendResetPasswordEmail (email, token) {
    try {
      const verificationLink = RESET_PASSWORD_EMAIL + `${token}` // este link me manda a la pagina donde ingresas la nueva contraseña
      await transport.sendMail({
        from: '"Correo de recuperación de contraseña 👻" <lernerapp2024@gmail.com>',
        to: email,
        subject: 'Correo de recuperación de contraseña ✔',
        html:
          `
            <html>
              <head>
                <style>
                  body, html {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                  }
                  body {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                </style>
              </head>
              <body>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center">
                      <h2>Restablecer tu contraseña</h2>
                      <p>¡Hola!</p>
                      <p>Recibes este correo porque has solicitado restablecer la contraseña de tu cuenta. Si no has solicitado este cambio, puedes ignorar este mensaje de forma segura.</p>
                      <p>Para restablecer tu contraseña, simplemente haz clic en el siguiente enlace:</p>
                      <a href="${verificationLink}" style="display: inline-block; background-color: #EE6F57; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Restablecer tu contraseña
                      </a>                      
                      <p>Gracias</p>
                      <p>El equipo de [Nombre de la aplicación/servicio]</p>                      
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `
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
        subject: 'Confirma tu correo electrónico ✔',
        html:
        `
          <html>
            <head>
              <style>
                body, html {
                  height: 100%;
                  margin: 0;
                  padding: 0;
                }
                body {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
              </style>
            </head>

            <body>
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <h2>¡Confirma tu correo electrónico!</h2>
                    <p>¡Hola!</p>
                    <p>Por favor, haz clic en el siguiente botón para confirmar tu correo electrónico:</p>   
                    <a href="${confirmationUrl}" style="display: inline-block; background-color: #EE6F57; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                      Verificar correo electrónico
                    </a>                                 
                    <p>Gracias</p>
                    <p>El equipo de [Nombre de la aplicación/servicio]</p>                      
                  </td>
                </tr>
              </table>
            </body>                        
          </html>
        `

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

  async resetPassword (dataToken, validatedData) {
    // reseteamos nueva contraseña
    let transaction

    try {
      transaction = await sequelize.transaction()

      const passwordHash = await encrypt(validatedData.password)
      let idCredentials
      try {
        idCredentials = await UserInfo.findOne({ where: { id_info_usuario: dataToken._id } })
      } catch (error) {
        LOG.error('No se encontro usuario al resetear contraseña')
        return null
      }
      try {
        await userCredentials.update({ hash_password: passwordHash }, { where: { id_credenciales_usuario: idCredentials.get('id_usuario') } }, { transaction })
        LOG.info('contraseña reseteada con exito')
        // return true
      } catch (error) {
        LOG.error(`No se pudo actualizar la contraseña, error: ${error.message}`)
        return null
      }
      await transaction.commit()
      return true
    } catch (error) {
      LOG.error(error)
      if (transaction) await transaction.rollback()
      throw new Error('Error al actualizar contraseña de usuario:' + error.message)
    }
  }
}

module.exports = new UserService()
