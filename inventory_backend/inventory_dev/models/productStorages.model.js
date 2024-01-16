const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const supplyProductModel = require('./supplyProduct.model');
const storagesModel = require('./storages.model');
const productStorages = db.define('productstorages',{
    id:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    quantity:{type:Sequelize.INTEGER,null:false},
},{timestamps: false})
productStorages.belongsTo(supplyProductModel , {foreignKey: 'product_id', targetKey: 'productId',primaryKey: true});
productStorages.belongsTo(storagesModel , {foreignKey: 'storage_id', targetKey: 'storageId',primaryKey: true});

module.exports=productStorages;