import { isString, IsNotEmpty, IsEmail, IsEnum, Length, Matches } = require('validator')
import { USER_ROLES } = require ('../../enums/roles.enums')

class CreateAccountDTO {
  constructor (name, firstName, lastName, email, password, confirmPassword) {
    this.name = name
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
    this.password = password
    this.confirmPassword = confirmPassword
  }

  validate () {
    if (!isString(this.name)) {
      throw new Error('El nombre debe ser una cadena')
    }
    if (!isString(this.username)) {
      throw new Error('El nombre de usuario debe ser una cadena')
    }
    if (!isString(this.apellidoPaterno)) {
      throw new Error('El apellido paterno debe ser una cadena')
    }
    if (!isString(this.apellidoMaterno)) {
      throw new Error('El apellido materno debe ser una cadena')
    }
    if (!isEmail(this.correo)) {
      throw new Error('El formato del correo electrónico no es válido')
    }
    if (!isString(this.contrasena)) {
      throw new Error('La contraseña debe ser una cadena')
    }
    if (!isString(this.confirmarContrasena)) {
      throw new Error('La confirmación de contraseña debe ser una cadena')
    }
    if (this.contrasena !== this.confirmarContrasena) {
      throw new Error('La contraseña y la confirmación de contraseña no coinciden')
    }
    // Agrega más validaciones según sea necesario
  }
}

module.exports = CreateAccountDTO
