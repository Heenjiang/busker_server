const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");
const Model = Sequelize.Model;

class Comment extends Model {}
Comment.init({
    comment_id: {type: Sequelize.INTEGER, primaryKey: true, unique: true},
    user_id: {type: Sequelize.INTEGER, allowNull: false},
    object_id: {type: Sequelize.INTEGER, allowNull: false},
    comment_type_id: {type: Sequelize.INTEGER, allowNull: false},
    comment_content: {type: Sequelize.STRING, allowNull: false},
    comment_star_count: {type: Sequelize.INTEGER, allowNull: false},
    comment_published_time: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0 },
    comment_parent_id: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
    comment_status: {type: Sequelize.INTEGER, allowNull: false},
    comment_replies_count: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 0},
}, { sequelize, 
     timestamps: false,
     freezeTableName: true,
     modelName: 'comments' });

module.exports = Comment;