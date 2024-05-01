class CreateEvaluationDTO {
  constructor (title, feedback, activationDate, activationTime, duration, idDinamic, creationDate) {
    this.title = title
    this.feedback = feedback
    this.activationDate = activationDate
    this.activationTime = activationTime
    this.duration = duration
    this.idDinamic = idDinamic
    this.creationDate = creationDate
  }
}

module.exports = CreateEvaluationDTO
