const { Sequelize } = require('sequelize');

// Railway might use different variable names
const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PRIVATE_URL || process.env.MYSQL_URL;

console.log('Database URL exists:', !!databaseUrl);

if (!databaseUrl) {
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('MYSQL')));
  throw new Error('No database URL found in environment variables');
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    ssl: false
  }
});

module.exports = sequelize;