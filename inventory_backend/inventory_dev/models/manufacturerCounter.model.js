const Sequelize = require('sequelize');
const db = require('../models/sequelize.model');
const manufacturercountries = db.define('manufacturercountrie',{
    manufacturerCountryId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    country:{type:Sequelize.STRING(50) , null:false},
    isDeleted:{type:Sequelize.ENUM("0","1"),null:true}
},{timestamps: false})
module.exports=manufacturercountries;