const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,        // Changed: MYSQL_USER → MYSQLUSER
  process.env.MYSQL_PASSWORD,    // Changed: MYSQL_PASSWORD → MYSQLPASSWORD
  {
    host: process.env.MYSQLHOST,  // Changed: MYSQL_HOST → MYSQLHOST
    port: process.env.MYSQLPORT || 3306,  // Changed: MYSQL_PORT → MYSQLPORT
    dialect: 'mysql',
    logging: console.log
  }
);

module.exports = sequelize;