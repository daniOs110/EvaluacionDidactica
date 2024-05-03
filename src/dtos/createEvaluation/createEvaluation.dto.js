class CreateEvaluationDTO {
  constructor (title, subtitle, description, feedback, activationDate, activationTime, duration, idDinamic, creationDate) {
    this.title = title
    this.subtitle = subtitle
    this.description = description
    this.feedback = feedback
    this.activationDate = activationDate
    this.activationTime = activationTime
    this.duration = duration
    this.idDinamic = idDinamic
    this.creationDate = creationDate
  }
}

module.exports = CreateEvaluationDTO
