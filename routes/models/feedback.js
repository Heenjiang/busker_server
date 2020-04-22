const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");
const Model = Sequelize.Model;

class Feedback extends Model {}
Feedback.init({
    feedback_id: {type: Sequelize.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
    feedback_content: {type: Sequelize.STRING, allowNull: false},
    sender_email_address: {type: Sequelize.STRING, allowNull: false},
    sender_first_name: {type: Sequelize.STRING, allowNull: false},
    sender_last_name: {type: Sequelize.STRING, allowNull: false},
    feedback_published_time: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0 },
    feedback_status: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 1},
}, { sequelize, 
     timestamps: false,
     freezeTableName: true,
     modelName: 'feedback' });

module.exports = Feedback;