const Sequelize = require('sequelize');
const db = require('../models/sequelize.model');
const user = db.define('user',{
    userId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    fullName:{type:Sequelize.STRING(50) , null:false},
    userName:{type:Sequelize.STRING(50) , unique:true, null:false},
    email:{type:Sequelize.STRING(100) , unique:true, null:false},
    password:{type:Sequelize.STRING(200),unique:true, null:false },
    phone : {type:Sequelize.STRING(20), null:false},
    joinDate :{type:Sequelize.DATE, null:false },
    type:{type:Sequelize.ENUM("admin","cashier"),null:false},
    isDeleted:{type:Sequelize.ENUM("0","1"),null:true}

},{timestamps: false})
module.exports=user;