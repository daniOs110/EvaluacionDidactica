const { Sequelize, Model, DataTypes, EmptyResultError } = require('sequelize')
const sequelize = require('../../config/database')
const Questions = require('./questions.schema')
const Response = require('./response.schema')
const GuestUsers = require('./guest.user.schema')

class EvaluationResults extends Model {}

EvaluationResults.init({
  id_resultado_evaluaciones: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
  }
},
{
  sequelize,
  modelName: 'resultados_evaluaciones',
  timestamps: false
}
)
EvaluationResults.belongsTo(Questions, { foreignKey: 'id_pregunta', as: 'pregunta' })
EvaluationResults.belongsTo(Response, { foreignKey: 'id_respuesta_seleccionada', as: 'respuesta' })
EvaluationResults.belongsTo(GuestUsers, { foreignKey: 'id_usuario', as: 'usuario' })

module.exports = EvaluationResults
