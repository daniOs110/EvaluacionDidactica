const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const UserCredentials = require('./user.crendentials.schema')

class UserInfo extends Model {}

UserInfo.init({
  id_info_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    defaultValue: 0
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido_paterno: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido_materno: {
    type: DataTypes.STRING,
    allowNull: true
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  verificado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'info_usuarios',
  timestamps: false
})

UserInfo.belongsTo(UserCredentials, { foreignKey: 'id_usuario', as: 'usuario' })

module.exports = UserInfo
