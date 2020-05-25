const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");
const Model = Sequelize.Model;

class AlbumTransaction extends Model {}
AlbumTransaction.init({
    transaction_id: {type: Sequelize.INTEGER, primaryKey: true, unique: true},
    register_id: {type: Sequelize.INTEGER, allowNull: false},
    album_id: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
    transaction_time: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0 },
    transaction_costs: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0},
    transaction_comment: {type: Sequelize.STRING, allowNull: false, defaultValue:'暂无评论'},
    transaction_status: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 2 },
}, { sequelize, 
     timestamps: false,
     freezeTableName: true,
     modelName: 'album_transaction' });

module.exports = AlbumTransaction;