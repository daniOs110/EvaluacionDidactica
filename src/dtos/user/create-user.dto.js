class CreateAccountDTO {
  constructor (name, firstName, lastName, email, password, confirmPassword) {
    this.name = name
    this.firstName = firstName
    this.lastName = lastName
    this.email = email
    this.password = password
    this.confirmPassword = confirmPassword
  }
}

module.exports = CreateAccountDTO
