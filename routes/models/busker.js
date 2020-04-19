const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");
const Model = Sequelize.Model;

class Busker extends Model {}
Busker.init({
    busker_id: {type: Sequelize.INTEGER, primaryKey: true, unique: true},
    busker_nick_name: Sequelize.STRING,
    instruments: Sequelize.STRING,
    busker_introduction: Sequelize.STRING,
    busker_visits: {type: Sequelize.INTEGER, defaultValue: 1},
}, { sequelize, 
     timestamps: false,
     freezeTableName: true,
     modelName: 'busker' });

module.exports = Busker;