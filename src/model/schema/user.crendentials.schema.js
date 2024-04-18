const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const RolDeUsuario = require('./user.roll.schema')

class UserCredentials extends Model {}

UserCredentials.init({
  idCredencialesUsuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  hashPassword: {
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
  timestamps: true
})

UserCredentials.belongsTo(RolDeUsuario, { foreignKey: 'idRolesDeUsuario', as: 'role' })
module.exports = UserCredentials
