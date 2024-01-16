const Sequelize = require('sequelize');
const db = require('./sequelize.model');
const supplyNameModel = require('./supplyName.model');
const supplyNamesModel = require("./supplyName.model");
const releaseYearModel = require("./releaseYear.model");
const carModelsModel = require("./carModels.model");
const companiesModel = require('./compaines.model');
const supplyProduct= db.define('supplyproduct',{
    productId:{type:Sequelize.INTEGER, primaryKey:true , autoIncrement:true , null:false},
    productName:{type:Sequelize.STRING(100) , null:false },
    shortName:{type:Sequelize.STRING(60) , null:false },
    barcode:{type:Sequelize.STRING(100) , null:false },
    productDescription:{type:Sequelize.STRING(500),null:false},
    quantity:{type:Sequelize.INTEGER,null:false},
    criticalQuantity:{type:Sequelize.INTEGER,null:true},
    piecePrice:{type:Sequelize.DOUBLE,null:false},
    piecePurchasePrice:{type:Sequelize.DOUBLE,null:false},
    manufacturerCountery:{type:Sequelize.STRING(150)},
    isDeleted:{type:Sequelize.ENUM("0","1"),null:true},
    addedAt:{type:Sequelize.DATE, null:false },
    modifiedAt:{type : Sequelize.DATE , null:true}

},{timestamps: false})
supplyProduct.belongsTo(supplyNamesModel , {foreignKey: 'supplyName_id', targetKey: 'supplyNameId'});
supplyProduct.belongsTo(releaseYearModel , {foreignKey: 'releaseYear_id', targetKey: 'releaseYearId'});
supplyProduct.belongsTo(carModelsModel , {foreignKey: 'carModel_id', targetKey: 'carModelId'});
supplyProduct.belongsTo(companiesModel , {foreignKey: 'supplier_id', targetKey: 'companyId'});
// supplyProduct.belongsTo(storagesModel, {
//     through: productStoragesModel,
//     foreignKey: 'product_id'
//   });

module.exports=supplyProduct;