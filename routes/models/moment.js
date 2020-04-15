const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");
const Model = Sequelize.Model;

class Moment extends Model {}
Moment.init({
    moment_id: {type: Sequelize.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    busker_id: {type: Sequelize.INTEGER, allowNull: false},
    moment_published_time: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0 },
    moment_content: {type: Sequelize.STRING, allowNull: false},
    moment_status: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 1},
    moment_trend: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
    moment_published_address: {type: Sequelize.STRING, allowNull: false},
}, { sequelize, 
     timestamps: false,
     freezeTableName: true,
     modelName: 'moments' });

module.exports = Moment;