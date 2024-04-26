const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const RolDeUsuario = require('./user.roll.schema')

class UserCredentials extends Model {}

UserCredentials.init({
  id_credenciales_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    defaultValue: 0
  },
  hash_password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  salt: {
    type: DataTypes.STRING,
    allowNull: false
  }
},
{
  sequelize,
  modelName: 'credenciales_usuarios',
  timestamps: false
})

UserCredentials.belongsTo(RolDeUsuario, { foreignKey: 'id_roles_de_usuario', as: 'role' })
module.exports = UserCredentials
