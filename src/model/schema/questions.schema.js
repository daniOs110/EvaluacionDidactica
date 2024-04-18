const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const Evaluation = require('./evaluation.schemas')

class Questions extends Model {}

Questions.init({
  id_pregunta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pregunta: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numero_respuestas: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
},
{
  sequelize,
  modelName: 'preguntas',
  timestamps: false
}
)

Questions.belongsTo(Evaluation, { foreignKey: 'id_evaluacion', as: 'evaluacion' })

module.exports = Questions
