const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");
const Model = Sequelize.Model;

class Trailer extends Model {}
Trailer.init({
    trailer_id: {type: Sequelize.INTEGER, primaryKey: true, unique: true},
    busker_id: {type: Sequelize.INTEGER, allowNull: false},
    trailer_participant: {type: Sequelize.STRING, allowNull: false},
    trailer_performing_time: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0 },
    trailer_perform_adress: {type: Sequelize.STRING, allowNull: false},
    trailer_published_time: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0 },
    trailer_poster: {type: Sequelize.INTEGER, allowNull: false},
    trailer_description: {type: Sequelize.STRING, allowNull: false},
    trailer_status: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 1},
    trailer_likes: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
    trailer_visits: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 1},
}, { sequelize, 
     timestamps: false,
     freezeTableName: true,
     modelName: 'trailer' });

module.exports = Trailer;