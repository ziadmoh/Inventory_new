const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const supplyProductModel = require('./supplyProduct.model');
const productInstance= db.define('productinstance',{
    productInstanceId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    productName:{type:Sequelize.STRING(100) , null:false },
    productDescription:{type:Sequelize.STRING(500),null:false},
    barCode :{type:Sequelize.STRING(100),null:false},
    isDeleted:{type:Sequelize.ENUM("0","1"),null:true},
},{timestamps: false})
productInstance.belongsTo(supplyProductModel , {foreignKey: 'productId', targetKey: 'product_id'});

module.exports=productInstance;