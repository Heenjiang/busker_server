const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");
const Model = Sequelize.Model;

class Tag extends Model {}
Tag.init({
    tag_id: {type: Sequelize.INTEGER, primaryKey: true, unique: true},
    tag_name: {type: Sequelize.STRING, allowNull: false},
    
}, { sequelize, 
     timestamps: false,
     freezeTableName: true,
     modelName: 'tags' });
module.exports = Tag;