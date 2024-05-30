const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const Pregunta = require('../schema/questions.schema') // Asegúrate de tener definido este modelo
const Ordenamiento = require('../schema/sorting.schema') // Asegúrate de tener definido este modelo

class Valor extends Model {}

Valor.init({
  id_valor: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_pregunta: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  id_ordenamiento: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  porcentaje: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'valor',
  timestamps: false
})

Valor.belongsTo(Pregunta, { foreignKey: 'id_pregunta', as: 'pregunta', onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
Valor.belongsTo(Ordenamiento, { foreignKey: 'id_ordenamiento', as: 'ordenamiento', onDelete: 'CASCADE', onUpdate: 'NO ACTION' })

module.exports = Valor
