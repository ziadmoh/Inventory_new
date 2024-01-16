const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const releaseyearModel = require('./releaseYear.model');
const supplyType= db.define('supplytype',{
    supplyTypeId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    type:{type:Sequelize.STRING(80) , null:false },
    isDeleted:{type:Sequelize.ENUM("0","1"),null:true}
},{timestamps: false})
module.exports=supplyType;