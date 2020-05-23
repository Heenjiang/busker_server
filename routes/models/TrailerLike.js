const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");
const Model = Sequelize.Model;

class TrailerLike extends Model {}
TrailerLike.init({
    trailer_like_id: {type: Sequelize.INTEGER, primaryKey: true, unique: true},
    register_id: {type: Sequelize.INTEGER, allowNull: false},
    trailer_id: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    register_click_time: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0 },
    status: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
}, { sequelize, 
     timestamps: false,
     freezeTableName: true,
     modelName: 'trailer_like' });

module.exports = TrailerLike;