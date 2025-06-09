const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use Railway's built-in DATABASE_URL - this always works
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    ssl: false
  }
});

module.exports = sequelize;