const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const GuestUsers = require('./guest.user.schema')
const RegisterUser = require('./user.info.schema')

class CalificacionUsuarios extends Model {}

CalificacionUsuarios.init({
  id_usuario_invitado: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: GuestUsers,
      key: 'id_usuarios_invitados'
    }
  },
  id_usuario_registrado: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: RegisterUser,
      key: 'id_info_usuario'
    }
  },
  id_evaluacion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  correcta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  total_pregunta: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'calificacion_usuarios',
  timestamps: false
})

CalificacionUsuarios.belongsTo(GuestUsers, { foreignKey: 'id_usuario_invitado', as: 'usuario_invitado' })
CalificacionUsuarios.belongsTo(RegisterUser, { foreignKey: 'id_usuario_registrado', as: 'usuario_registrado' })

module.exports = CalificacionUsuarios
