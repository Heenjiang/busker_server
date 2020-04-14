const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");
const Model = Sequelize.Model;

class User extends Model {}
User.init({
    user_id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, unique: true},
    user_type_id: Sequelize.INTEGER,
    username: Sequelize.STRING,
    icon_path: Sequelize.STRING,
    password: Sequelize.STRING,
    balance: Sequelize.FLOAT,
    sex: Sequelize.INTEGER,
    date_of_birth:Sequelize.FLOAT,
    registered_time: Sequelize.FLOAT,
    user_status: Sequelize.INTEGER,
}, { sequelize, 
     timestamps: false,
     freezeTableName: true,
     modelName: 'user' });

module.exports = User;