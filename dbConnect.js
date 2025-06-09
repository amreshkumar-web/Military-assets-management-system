const { Sequelize } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(
  process.env.DB_NAME,      // database name
  process.env.DB_USER,      // username
  process.env.DB_PASSWORD,  // password
  {
    host: process.env.DB_HOST, // cloud MySQL host
    dialect: 'mysql',          // use 'mysql' for MySQL
    logging: false,            // disable SQL logging in production
  }
);

module.exports = sequelize;