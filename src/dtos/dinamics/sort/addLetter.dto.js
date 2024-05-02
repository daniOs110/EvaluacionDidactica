class AddLetterDTO {
  constructor (letter, idEvaluacion, idDinamica, questionNumber) {
    this.letter = letter
    this.idEvaluacion = idEvaluacion
    this.idDinamica = idDinamica

    this.questionNumber = questionNumber
  }
}

module.exports = AddLetterDTO
