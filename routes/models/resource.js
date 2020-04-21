const Sequelize = require('sequelize');
const sequelize = require("../common/ormConfiguration");
const Model = Sequelize.Model;

class Resource extends Model {}
Resource.init({
    resource_id: {type: Sequelize.INTEGER, primaryKey: true, unique: true},
    resource_type_id: {type: Sequelize.INTEGER, allowNull: false},
    resource_object_id: {type: Sequelize.INTEGER, allowNull: true},
    resource_url: {type: Sequelize.STRING, allowNull: false},
    resource_uploaded_time: {type: Sequelize.FLOAT, allowNull: false, defaultValue: 0.0 },
    resource_description: {type: Sequelize.STRING, allowNull: false, defaultValue: '暂无描述'},
    resource_status: {type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
}, { sequelize, 
     timestamps: false,
     freezeTableName: true,
     modelName: 'resources' });

module.exports = Resource;