const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const invoicesModel = require('./invoices.model');
const expenseRetrun= db.define('expensereturns',{
    expenseReturnId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    originalInvoiceQuantity:{type:Sequelize.INTEGER,null:false},
    returnedQuantity:{type:Sequelize.INTEGER,null:false},
    originalTotalFees:{type:Sequelize.DOUBLE,null:false},
    returnedTotalFees:{type:Sequelize.INTEGER,null:false},
    addedAt:{type:Sequelize.DATE, null:false },
    storages:{type:Sequelize.JSON,null:false},
},{timestamps: false})
expenseRetrun.belongsTo(invoicesModel , {foreignKey: 'invoice_id', targetKey: 'invoiceId'});

module.exports=expenseRetrun;