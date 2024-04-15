const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require("../../config/database");

class ResponseType extends Model{}

ResponseType.init({
    id_tipo_respuesta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo_respuesta: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
{
    sequelize,
    modelName: 'tipo_respuestas',
    timestamps: false
});

module.exports = ResponseType;

