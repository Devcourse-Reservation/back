const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('flight', 'root', 'Peayss1!', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;