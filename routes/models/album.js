const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");
const Model = Sequelize.Model;

class Album extends Model {}
Album.init({
    album_id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, unique: true, allowNull: false},
    busker_id: {type: Sequelize.INTEGER, allowNull: false},
    album_name: {type: Sequelize.STRING, allowNull: false},
    album_description: {type: Sequelize.STRING, allowNull: false, defaultValue: '暂无描述'},
    album_price: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0},
    album_sales: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    album_score: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0 },
    album_published_time: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0 },
    album_single_number: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    album_status: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 2 },
    album_author: {type: Sequelize.STRING, allowNull: false, defaultValue: '暂无作者描述'},
}, { sequelize, 
     timestamps: false,
     freezeTableName: true,
     modelName: 'album' });

module.exports = Album;