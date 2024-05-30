const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const Pregunta = require('../schema/questions.schema')

class PosicionCrucigrama extends Model {}

PosicionCrucigrama.init({
  id_posicion_crucigrama: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_pregunta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  respuesta_texto: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  orientacion: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  inicio_x: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  inicio_y: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'posicion_crucigrama',
  timestamps: false
})

PosicionCrucigrama.belongsTo(Pregunta, { foreignKey: 'id_pregunta', as: 'pregunta', onDelete: 'CASCADE', onUpdate: 'NO ACTION' })

module.exports = PosicionCrucigrama
