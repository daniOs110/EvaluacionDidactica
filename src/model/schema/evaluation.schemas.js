const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const Dinamic = require('./dinamic.schema')
const UserCredentials = require('./user.crendentials.schema')

class Evaluation extends Model {}

Evaluation.init({
  id_evaluaciones: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  retroalimentacion_activa: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  fecha_activacion: {
    type: DataTypes.DATE,
    allowNull: false
  },
  hora_activacion: {
    type: DataTypes.TIME,
    allowNull: false
  },
  duracion: {
    type: DataTypes.TIME,
    allowNull: false
  }
},
{
  sequelize,
  modelName: 'evaluaciones',
  timestamps: true
}
)

Evaluation.belongsTo(UserCredentials, { foreignKey: 'id_usuario', as: 'usuario' })
Evaluation.belongsTo(Dinamic, { foreignKey: 'id_dinamica', as: 'dinamica' })

module.exports = Evaluation
