const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database') // Asegúrate de ajustar la ruta según la ubicación de tu archivo de configuración de la base de datos
const Evaluations = require('./evaluation.schemas') // Importa el modelo de Evaluaciones si aún no lo has hecho

class Sorting extends Model {}

Sorting.init({
  id_ordenamiento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  oracion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  id_evaluacion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  num_pregunta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: true // Permitir que el campo sea nulo según tu definición en la tabla
  }
},
{
  sequelize,
  modelName: 'ordenamiento',
  // tableName: 'ordenamiento', // Nombre de la tabla en la base de datos (opcional)
  timestamps: false,
  freezeTableName: true
})

// Definir las relaciones
Sorting.belongsTo(Evaluations, { foreignKey: 'id_evaluacion', as: 'evaluacion', onDelete: 'CASCADE' })

module.exports = Sorting
