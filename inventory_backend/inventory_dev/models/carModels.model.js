const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const carBrandsModel = require('./carBrands.model');
const carModels = db.define('carmodel',{
    carModelId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    model:{type:Sequelize.STRING(80) , null:false },
    isDeleted:{type:Sequelize.ENUM("0","1"),null:true}
},{timestamps: false})
carModels.belongsTo(carBrandsModel , {foreignKey: 'carBrand_id', targetKey: 'carBrandId'});

module.exports=carModels;