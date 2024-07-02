const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const Questions = require('./questions.schema')
const Response = require('./response.schema')
const GuestUsers = require('./guest.user.schema')
const RegisterUser = require('./user.info.schema')
const Evaluations = require('./evaluation.schemas') // Importa el modelo de Evaluaciones

class EvaluationResults extends Model {}

EvaluationResults.init({
  id_resultado_evaluaciones: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario_invitado: {
    type: DataTypes.INTEGER,
    allowNull: true // Permitir que el campo sea nulo según tu definición en la tabla
  },
  id_pregunta: {
    type: DataTypes.INTEGER,
    allowNull: true // Permitir que el campo sea nulo según tu definición en la tabla
  },
  id_respuesta_seleccionada: {
    type: DataTypes.INTEGER,
    allowNull: true // Permitir que el campo sea nulo según tu definición en la tabla
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
  },
  id_evaluacion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_usuario_registrado: {
    type: DataTypes.INTEGER,
    allowNull: true // Permitir que el campo sea nulo según tu definición en la tabla
  },
  id_pregunta_ordenamiento: {
    type: DataTypes.INTEGER,
    allowNull: true // Permitir que el campo sea nulo según tu definición en la tabla
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  opcion_ordenamiento: {
    type: DataTypes.STRING(45),
    allowNull: true // Permitir que el campo sea nulo según tu definición en la tabla
  },
  oracion_usuario: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
},
{
  sequelize,
  modelName: 'resultados_evaluaciones',
  timestamps: false
})

// Definir las relaciones
EvaluationResults.belongsTo(Questions, { foreignKey: 'id_pregunta', as: 'pregunta' })
EvaluationResults.belongsTo(Response, { foreignKey: 'id_respuesta_seleccionada', as: 'respuesta' })
EvaluationResults.belongsTo(GuestUsers, { foreignKey: 'id_usuario_invitado', as: 'usuario_invitado' })
EvaluationResults.belongsTo(RegisterUser, { foreignKey: 'id_usuario_registrado', as: 'usuario_registrado' })
EvaluationResults.belongsTo(Evaluations, { foreignKey: 'id_evaluacion', as: 'evaluacion' })

module.exports = EvaluationResults
