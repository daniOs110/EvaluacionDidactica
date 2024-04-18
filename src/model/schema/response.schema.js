const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../../config/database')
const Questions = require('./questions.schema')
const ResponseType = require('./response.type.schema')

class Response extends Model {}

Response.init({
  id_respuesta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  opcion_respuesta_texto: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'texto de respuestas'
  },
  status_respuesta: {
    type: DataTypes.TINYINT,
    allowNull: false
  },
  opcion_respuesta_imagen: {
    type: DataTypes.BLOB,
    allowNull: true
  }
},
{
  sequelize,
  modelName: 'respuestas',
  timestamps: false
})

Response.belongsTo(Questions, { foreignKey: 'id_pregunta', as: 'pregunta' })
Response.belongsTo(ResponseType, { foreignKey: 'id_tipo_respuesta', as: 'tipo_respuesta' })

module.exports = Response
