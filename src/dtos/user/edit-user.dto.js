class EditAccountDTO {
    constructor (correo, nombre, apellido_paterno, apellido_materno, verificado) {
      this.correo = correo
      this.nombre = nombre
      this.apellido_paterno = apellido_paterno
      this.apellido_materno = apellido_materno
      this.verificado = verificado
    }
  }
  
  module.exports = EditAccountDTO
  