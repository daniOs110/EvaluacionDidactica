const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const Evaluacion = require('../schema/evaluation.schemas')

class Tablero extends Model {}

Tablero.init({
  id_tablero: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_evaluacion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  columna: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fila: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'tablero',
  freezeTableName: true,
  timestamps: false
})

Tablero.belongsTo(Evaluacion, { foreignKey: 'id_evaluacion', as: 'evaluacion', onDelete: 'CASCADE', onUpdate: 'NO ACTION' })

module.exports = Tablero
