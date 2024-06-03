const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const Dinamic = require('./dinamic.schema')
const UserInfo = require('./user.info.schema')

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
  // duracion: {
  //   type: DataTypes.TIME,
  //   allowNull: false
  // },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false
  },
  active: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  subtitulo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fecha_desactivacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  hora_desactivacion: {
    type: DataTypes.TIME,
    allowNull: true
  },
  customizar_puntuacion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }

},
{
  sequelize,
  modelName: 'evaluaciones',
  timestamps: false
}
)

Evaluation.belongsTo(UserInfo, { foreignKey: 'id_usuario', as: 'usuario' })
Evaluation.belongsTo(Dinamic, { foreignKey: 'id_dinamica', as: 'dinamica' })

module.exports = Evaluation
