const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = require("../../config/database");

class Clasification extends Model{}

Clasification.init({
    id_clasificacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    clasificacion: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
{
    sequelize,
    modelName: 'clasificacion',
    timestamps: false
});

module.exports = Clasification;