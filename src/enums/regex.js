const regexPatterns = {
  LETTERS_ONLY: /^[a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]+$/,
  EMAIL_FORMAT: /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gm
}

module.exports = regexPatterns
