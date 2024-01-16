const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const userModel = require('./user.model');
const storageModel = require('./storages.model');
const sessions= db.define('session',{
    sessionId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    isOrderConfirmed:{type:Sequelize.ENUM("0","1"),null:true},
    creationDate:{type:Sequelize.DATE, null:false },
},{timestamps: false})
sessions.belongsTo(userModel , {foreignKey: 'user_id', targetKey: 'userId'});
sessions.belongsTo(storageModel , {foreignKey: 'storage_id', targetKey: 'storageId'});

module.exports=sessions;