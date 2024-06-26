const { Sequelize, Model, DataTypes } = require('sequelize')
const sequelize = require('../config/database')
const LOG = require('../app/logger')

// const sequelize = new Sequelize("evaluacionesdidacticas", "root", "12345678", {
//     host: "localhost",
//     dialect: "mysql",
//     port: "3306"
// })

class Product extends Model {}

Product.init({
  product_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  product_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT(10, 2),
    allowNull: false
  },
  is_stock: {
    type: DataTypes.BOOLEAN
  }
},
{
  sequelize,
  modelName: 'Product'
}
)

module.exports = Product

async function testConnection () {
  try {
    await sequelize.authenticate()
    LOG.info('All Good!!')
  } catch (err) {
    console.error('All bad!!', err)
  }
}

testConnection()
