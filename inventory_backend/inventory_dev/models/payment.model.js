const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const companiesModel = require('./compaines.model');
const invoicesModel = require('./invoices.model');
const payment= db.define('payment',{
    processId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    deposite:{type:Sequelize.DOUBLE,null:false},
    addedAt:{type:Sequelize.DATE, null:false },
},{timestamps: false})
payment.belongsTo(invoicesModel , {foreignKey: 'invoice_id', targetKey: 'invoiceId'});
module.exports=payment;