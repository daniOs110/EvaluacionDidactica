const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const Clasification = require('./clasifications.schema')

class Dinamic extends Model {}

Dinamic.init({
  id_dinamicas: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dinamica: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true
  }
},
{
  sequelize,
  modelName: 'dinamicas',
  timestamps: false
})

Dinamic.belongsTo(Clasification, { foreignKey: 'id_clasificacion', as: 'clasificacion' })

module.exports = Dinamic
