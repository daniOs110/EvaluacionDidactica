class GlobalConstants {
  static get URL_RESET_PASSWORD () {
    return 'http://localhost:3001/lerner/user/new-password/'
  }

  static get REGEX_NAMES () {
    return /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/
  }
}

module.exports = GlobalConstants
