class EditAccountDTO {
  constructor (correo, nombre, apellidoPaterno, apellidoMaterno, verificado) {
    this.correo = correo
    this.nombre = nombre
    this.apellidoPaterno = apellidoPaterno
    this.apellidoMaterno = apellidoMaterno
    this.verificado = verificado
  }
}

module.exports = EditAccountDTO
