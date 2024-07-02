const convertDeactivationData = (req, res, next) => {
  // Convertir la fecha de activación a formato ISO 8601
  if (req.body.deactivationDate) {
    req.body.deactivationDate = new Date(req.body.deactivationDate).toISOString()
  }
  // No necesitas convertir la hora, ya que isString() valida que sea una cadena

  next()
}

module.exports = { convertDeactivationData }
