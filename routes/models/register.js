const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");
const Model = Sequelize.Model;

class Register extends Model {}
Register.init({
    register_id: {type: Sequelize.INTEGER, primaryKey: true, unique: true},
    register_nick_name: Sequelize.STRING,
    register_signature: Sequelize.STRING,
}, { sequelize, 
     timestamps: false,
     freezeTableName: true,
     modelName: 'register' });

module.exports = Register;