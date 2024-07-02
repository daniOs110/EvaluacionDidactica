const convertActivationData = (req, res, next) => {
  // Convertir la fecha de activación a formato ISO 8601
  if (req.body.activationDate) {
    req.body.activationDate = new Date(req.body.activationDate).toISOString()
  }

  // No necesitas convertir la hora, ya que isString() valida que sea una cadena

  next()
}

module.exports = { convertActivationData }
