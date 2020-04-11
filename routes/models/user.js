const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");

class User extends Model {}
User.init({
  user_id: Sequelize.INTEGER                     ,
  user_type_id: Sequelize.INTEGER,
  username: Sequelize.STRING,
  icon_path: Sequelize.STRING,
  password: Sequelize.STRING,
  balance: Sequelize.FLOAT,
  SEX: Sequelize.INTEGER,
  date_of_birth: Sequelize.DATE,
  registered_time: Sequelize.DATE,
  user_status: Sequelize.INTEGER
}, { sequelize, modelName: 'user' })