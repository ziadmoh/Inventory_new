const Sequelize = require('sequelize');
module.exports = new Sequelize('inventory_dev_03_10_2023','root','',{ 
  host: 'localhost',
  dialect: 'mysql',
  logging: true,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
  });