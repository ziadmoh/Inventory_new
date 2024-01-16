const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const supplyTypeModel = require('./supplyType.model');
const supplyName= db.define('supplyname',{
    supplyNameId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    supply:{type:Sequelize.STRING(80) , null:false },
    isDeleted:{type:Sequelize.ENUM("0","1"),null:true}
},{timestamps: false})
supplyName.belongsTo(supplyTypeModel , {foreignKey: 'supplyType_id', targetKey: 'supplyTypeId'});
module.exports=supplyName;