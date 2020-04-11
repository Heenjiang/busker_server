const Sequelize = require('sequelize');

const sequelize = new Sequelize('buskerv2', 'root', '120788', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
  });

module.exports = sequelize;