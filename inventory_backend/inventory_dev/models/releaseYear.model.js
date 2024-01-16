const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const releaseyear= db.define('releaseyear',{
    releaseYearId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    year:{type:Sequelize.STRING(5) , null:false },
    isDeleted:{type:Sequelize.ENUM("0","1"),null:true}
},{timestamps: false})

module.exports=releaseyear;