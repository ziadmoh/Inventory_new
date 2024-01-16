const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const sessionModel = require('./sessions.model');
const supplyProductModel = require('./supplyProduct.model')
const compainesModel=require("./compaines.model");
const invoicesModel = require('./invoices.model');
const orderItemModel=require('./orderItems.model')
const retruning= db.define('returnedinvoice',{
    returningId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    addedAt:{type:Sequelize.DATE, null:false }
},{timestamps: false})
retruning.belongsTo(invoicesModel , {foreignKey: 'invoice_id', targetKey: 'invoiceId'});
retruning.belongsTo(orderItemModel , {foreignKey: 'orderItem_id', targetKey: 'orderItemId'});

module.exports=retruning;