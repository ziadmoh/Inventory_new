const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const companies= db.define('companie',{
    companyId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    type:{type:Sequelize.ENUM('supplier', 'customer'),null:false},
    companyName:{type:Sequelize.STRING(100),null:true},
    personName:{type:Sequelize.STRING(100),null:true},
    phone:{type:Sequelize.STRING(30),null:true},
    address:{type:Sequelize.STRING(100),null:true},
    addedAt:{type:Sequelize.DATE, null:true },
},{timestamps: false})
module.exports=companies