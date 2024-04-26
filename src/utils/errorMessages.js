class ErrorMessages {
  static get NAME_REQUIRED () {
    return 'El nombre es obligatorio y debe contener unicamente letras.'
  }

  static get FIRST_NAME_REQUIRED () {
    return 'El apellido paterno es obligatorio y debe contener unicamente letras.'
  }

  static get LAST_NAME_REQUIRED () {
    return 'El apellido materno debe contener unicamente letras.'
  }

  static get FORMAT_NAMES () {
    return 'El campo ingresado solo puede contener letras'
  }

  static get EMAIL_INVALID () {
    return 'El correo electrónico ingresado no es válido.'
  }

  static get GET_USER_EMAIL () {
    return 'Error al obtener el usuario por correo electrónico'
  }

  static get EMAIL_EXIST () {
    return 'El correo electrónico ya está en uso. Por favor, utiliza otro correo electrónico.'
  }

  static get EMAIL_NOT_EXIST () {
    return 'El correo electrónico no existe verifica el correo ingresado.'
  }

  static get PASSWORD_FORMAT () {
    return 'La contraseña no puede ser mayor a 15 caracteres ni menor a 3.'
  }

  static get PASSWORD_UNMATCH () {
    return 'La contraseñas no coinciden.'
  }

  static get WRONG_PASSWORD () {
    return 'La contraseñas es incorrecta.'
  }

  static get LOGIN_FAIL () {
    return 'Usuario o contraseña incorrectos'
  }

  static get USER_NOT_EXIST () {
    return 'no se encontro usuario registrado'
  }

  static get NOT_SESSION () {
    return 'No ha iniciado sesión o el token es invalido'
  }
}

module.exports = ErrorMessages
