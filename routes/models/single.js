const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");
const Model = Sequelize.Model;

class Single extends Model {}
Single.init({
    single_id: {type: Sequelize.INTEGER, primaryKey: true, unique: true},
    album_id: {type: Sequelize.INTEGER, allowNull: false},
    busker_id:{type: Sequelize.INTEGER, allowNull: false},
    single_link: {type: Sequelize.STRING, allowNull: false},
    single_description: {type: Sequelize.STRING, allowNull: false, defaultValue: '暂无描述'},
    single_type: {type: Sequelize.STRING, allowNull: false, defaultValue: ''},
    single_score: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0 },
    single_published_time: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0 },
    single_status: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    single_author: {type: Sequelize.STRING, allowNull: false, defaultValue: '暂无'},
    single_name: {type: Sequelize.STRING, allowNull: false, defaultValue: '暂无'},
    single_order: {type: Sequelize.INTEGER, allowNull: false},
}, { sequelize, 
     timestamps: false,
     freezeTableName: true,
     modelName: 'singles' });

module.exports = Single;