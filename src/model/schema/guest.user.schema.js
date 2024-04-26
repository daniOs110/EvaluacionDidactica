const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const UserRoll = require('./user.roll.schema')

class GuestUsers extends Model {}

GuestUsers.init({
  id_usuarios_invitados: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
},
{
  sequelize,
  modelName: 'usuarios_invitados',
  timestamps: false
})

GuestUsers.belongsTo(UserRoll, { foreignKey: 'id_roles_de_usuario_invitado', as: 'role' })

module.exports = GuestUsers
