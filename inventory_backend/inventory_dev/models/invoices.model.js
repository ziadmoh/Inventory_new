const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const sessionModel = require('./sessions.model');
const supplyProductModel = require('./supplyProduct.model')
const compainesModel=require("./compaines.model");
const storageModel=require("./storages.model");
const invoices= db.define('invoice',{
    invoiceId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    type:{type:Sequelize.ENUM('revenue', 'expense'),null:false},
    quantity:{type:Sequelize.INTEGER,null:false},
    totalFees:{type:Sequelize.DOUBLE,null:false},
    recievedFees:{type:Sequelize.DOUBLE,null:false},
    done:{type:Sequelize.ENUM('0', '1'),null:false},
    creationDate:{type:Sequelize.DATE, null:false },
    product:{type:Sequelize.JSON,null:false},
},{timestamps: false})
invoices.belongsTo(sessionModel , {foreignKey: 'session_id', targetKey: 'sessionId'});
invoices.belongsTo(supplyProductModel , {foreignKey: 'supplyProduct_id', targetKey: 'productId'});
invoices.belongsTo(compainesModel , {foreignKey: 'company_id', targetKey: 'companyId'});
invoices.belongsTo(storageModel , {foreignKey: 'storage_id', targetKey: 'storageId'});
module.exports=invoices;