class ErrorMessages {
  /**
   * USER REGISTER
   */
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

  static get SERVER_ERROR () {
    return 'Ocurrio un error en el servidor'
  }

  /**
   * CREATE EVALUATION
   */

  static get TITLE_FORMAT () {
    return 'El formato del titulo es incorrecto'
  }

  static get SUBTITLE_FORMAT () {
    return 'El formato del subtitulo es incorrecto'
  }

  static get DESCRIPTION_FORMAT () {
    return 'El formato de la descripción es incorrecto'
  }

  static get FEEDBACK_ERROR () {
    return 'El campo retroalimetación es necesario'
  }

  static get ACTIVATIONDATE_FORMAT () {
    return 'La fecha de activacion es necesaria y debe estar en el formato ISO 8601'
  }

  static get ACTIVATIONTIME_FORMAT () {
    return 'La hora de activación es necesaria'
  }

  static get DEACTIVATIONTIME_FORMAT () {
    return 'La hora de desactivación esta en formato incorrecto'
  }

  static get DURATION_FORMAT () {
    return 'La duración de la actividad es necesaria y debe ser numerico'
  }

  static get IDDINAMIC_FORMAT () {
    return 'El id de dinamica es necesario y debe ser una cadena'
  }

  static get CREATIONDATE_FORMAT () {
    return 'La fecha de creación es necesaria y debe estar en el formato ISO 8601'
  }

  static get BAD_DATE_FORMAT () {
    return 'La fecha esta en formato incorrecto, debe estar en el formato ISO 8601'
  }

  static get LETTER_FORMAT () {
    return 'formato incorrecto valida que sea una cadena'
  }

  static get GENERIC_NOT_NULL () {
    return ' el atributo ingresado no puede ser nulo'
  }
}

module.exports = ErrorMessages
