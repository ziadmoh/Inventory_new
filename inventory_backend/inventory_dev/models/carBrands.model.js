const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const manufacturercountriesModel = require('./manufacturerCounter.model');
const carBrands = db.define('carbrand',{
    carBrandId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    brand:{type:Sequelize.STRING(80) , null:false },
    isDeleted:{type:Sequelize.ENUM("0","1"),null:true}
},{timestamps: false})
carBrands.belongsTo(manufacturercountriesModel , {foreignKey: 'manuFacturerCounter_id', targetKey: 'manufacturerCountryId'});

module.exports=carBrands;