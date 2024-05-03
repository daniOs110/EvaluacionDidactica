const useEvaluationRouter = require('express').Router()

const authMiddleware = require('../middleware/session')

useEvaluationRouter.get('/share/evaluation', async (req, res) => {
  // Este metodo se llamadra cuando el usuario (profesor) pulse el boton compartir evalucion, generara un token con los datos de la evaluacion
})

useEvaluationRouter.post('/join/evaluation', async (req, res) => {
  // const user = req.user // datos de usuario
  // Este metodo se llamara cuando el usuario (alumno) entre a la pantalla unirme a evaluacion, donde ingresara el token compartido
  // este controller o servicio validara que cumple los datos y dependiendo que tipo de evaluacion es lo redigira al controller correspondiente (donde mostrara en pantalla los datos de la dinamica ingresados por el profesor)
})

module.exports = useEvaluationRouter
