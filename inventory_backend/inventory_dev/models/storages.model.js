const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const productstorage = db.define('storages',{
    storageId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    storageName:{type:Sequelize.STRING(100) , null:false },
    type:{type:Sequelize.ENUM("inventory","shop"),null:false},
    address:{type:Sequelize.STRING(100),null:true},
    isDeleted:{type:Sequelize.ENUM("0","1"),null:true}

},{timestamps: false})
module.exports=productstorage;