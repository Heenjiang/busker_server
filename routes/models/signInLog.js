const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");
const Model = Sequelize.Model;

class SignInLog extends Model {}
SignInLog.init({
    log_id: {type: Sequelize.INTEGER, primaryKey: true, unique: true},
    user_id: {type: Sequelize.INTEGER},
    signin_published_time: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0 },
    user_type: {type: Sequelize.INTEGER, allowNull: false},
}, { sequelize, 
     timestamps: false,
     freezeTableName: true,
     modelName: 'sign_in_log' });

module.exports = SignInLog;