const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const productModel = require('./supplyProduct.model');
const sessionModel = require('./sessions.model');
const storagesModel = require('./storages.model');
const orderItem= db.define('orderitem',{
    orderItemId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    quantity:{type:Sequelize.INTEGER , null:false},
    fee:{type:Sequelize.DOUBLE,null:false},
    product:{type:Sequelize.JSON,null:false},
    isReturned:{type:Sequelize.ENUM('0', '1'),null:false},
    returnDate:{type:Sequelize.DATE, null:false },
},{timestamps: false})
orderItem.belongsTo(sessionModel , {foreignKey: 'session_id', targetKey: 'sessionId'});
orderItem.belongsTo(productModel , {foreignKey: 'product_id', targetKey: 'productId'});
orderItem.belongsTo(storagesModel , {foreignKey: 'storage_id', targetKey: 'storageId'});
module.exports=orderItem;