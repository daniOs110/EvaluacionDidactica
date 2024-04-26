const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database')

class RolDeUsuario extends Model {}

RolDeUsuario.init({
  id_roles_de_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    defaultValue: 1
  },
  rol_de_usuario: {
    type: DataTypes.STRING,
    allowNull: false
  }
},
{
  sequelize,
  modelName: 'roles_de_usuario',
  timestamps: false
})

module.exports = RolDeUsuario
