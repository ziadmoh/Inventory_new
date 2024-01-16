const supplyProduct = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const db = require('../models/sequelize.model');
const moment = require('moment');
const manufacturerCountriesModel = require('../models/manufacturerCounter.model');
const { check, validationResult } = require('express-validator');
const Sequelize = require('sequelize');
const e = require('express');
const carBrandsModel = require('../models/carBrands.model')
const carModelsModel = require('../models/carModels.model');
const supplyTypeModel = require('../models/supplyType.model')
const supplyNameModel = require("../models/supplyName.model");
const supplyProductModel = require('../models/supplyProduct.model');
const productStoragesModel = require('../models/productStorages.model');
const storagesModal = require('../models/storages.model');
const releaseYearsModel = require('../models/releaseYear.model');
const invoicesModel = require("../models/invoices.model");
const userModel = require("../models/user.model");
const sessionModel = require('../models/sessions.model');
const companiesModel = require('../models/compaines.model');
const op = Sequelize.Op

// storages added for this api


supplyProduct.get('/allsupplyproducts', async (req, res) => {
    try {
        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page?page:1;
        let totalRecords = 0;
        
        let orderBy = req.query.orderBy;
        let orderType = req.query.orderType;

        if(!orderBy || orderBy == null || orderBy == undefined || orderBy  == '' ){
            orderBy = 'productName'
        }

        if(!orderType || orderType == null || orderType == undefined || orderType  == '' ){
            orderType = 'ASC'
        }
        const options = {
            limit, 
            offset,
            include: [
                { model: supplyNameModel, required: true, },
                { model: carModelsModel, required: false, include: [{ model: carBrandsModel, required: false }] },
                { model: releaseYearsModel, required: false },
                { model: companiesModel, required: false , }
            ],
            where: { isDeleted: "0" },
            order: [[Sequelize.col(orderBy), orderType]],
        };
    
        let supplyProducts = null;
        let storageId = req.query.storageId;
    
        if (storageId) { // storage selected
            const productStorages = await productStoragesModel.findAll({
                raw: true,
                where: { storage_id: storageId }
            });
    
            if (productStorages.length > 0) {
                const productIds = productStorages.map(ps => ps.product_id);
                options.where.productId = productIds;
            } else {
                res.json({ message: "الرقم التعريفي للمخزن غير صحيح", status: "failed" });
                return;
            }
        }
    
        supplyProducts = await supplyProductModel.findAndCountAll(options);
        totalRecords = supplyProducts.count;
    
        if (supplyProducts.rows.length === 0) {
            res.json({ message: "لم يتم العثور على اى منتجات", status: "failed" });
            return;
        }

        const data  =  supplyProducts.rows.map((row) => ({
            ...row.toJSON(),
            supplyName: row.supplyname,
            carModel: row.carmodel,
            supplier: row.companie,
            carBrand:  row.carmodel?.carbrand
        }));

        if(storageId){
            await Promise.all(
                data.map( async (element) => {
                    let productStorage = await productStoragesModel.findOne({
                        raw: true,
                        where: { storage_id: storageId, product_id:element.productId}
                    });
                    return element.quantity = productStorage.quantity
                })
            )
            
        }

        res.json({ paginationOptions: { totalRecords, current_page }, supplyProducts: data, status: "success" });
    
    }catch (err){
        console.log(err)
    }
});

supplyProduct.get('/product/:id', async (req, res) => {
    let productId = req.params.id
    let supplyProduct = await supplyProductModel.findOne({ raw: true, where: { productId, isDeleted: "0" } });
    if (supplyProduct) {
        res.json({ supplyProduct, status: "success" });
    }
    else {
        res.json({ message: "خطأ فى الرقم التعريفي", status: "failed" })
    }
})

supplyProduct.get('/supplynameproducts/:id', async (req, res) => {
    try {
        const { page, pageSize} = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page?page:1;
        let supplyNameId = req.params.id;
        let totalRecords = 0;
        
        let orderBy = req.query.orderBy;
        let orderType = req.query.orderType;
        if(!orderBy || orderBy == null || orderBy == undefined || orderBy  == '' ){
            orderBy = 'productName'
        }
        if(!orderType || orderType == null || orderType == undefined || orderType  == '' ){
            orderType = 'ASC'
        }
        const options = {
            limit, 
            offset,
            include: [
                { model: supplyNameModel, required: true,  where: { isDeleted: "0",}},
                { model: carModelsModel, required: false, include: [{ model: carBrandsModel, required: false }] },
                { model: releaseYearsModel, required: false },
                { model: companiesModel, required: false , }
            ],
            where: { isDeleted: "0",supplyName_id: supplyNameId},
            order: [[Sequelize.col(orderBy), orderType]],
        };
    
        let supplyProducts = null;
        let storageId = req.query.storageId;
    
        if (storageId) { // storage selected
            const productStorages = await productStoragesModel.findAll({
                raw: true,
                where: { storage_id: storageId, }
            });
    
            if (productStorages.length > 0) {
                const productIds = productStorages.map(ps => ps.product_id);
                options.where.productId = productIds;
            } else {
                res.json({ message: "الرقم التعريفي للمخزن غير صحيح", status: "failed" });
                return;
            }
        }
    
        supplyProducts = await supplyProductModel.findAndCountAll(options);
        totalRecords = supplyProducts.count;
    
        if (supplyProducts.rows.length === 0) {
            res.json({ message: "لم يتم العثور على اى منتجات", status: "failed" });
            return;
        }
        const data  =  supplyProducts.rows.map((row) => ({
            ...row.toJSON(),
            supplyName: row.supplyname,
            carModel: row.carmodel,
            supplier: row.companie,
            carBrand:  row.carmodel?.carbrand
        }));

        if(storageId){
            await Promise.all(
                data.map( async (element) => {
                    let productStorage = await productStoragesModel.findOne({
                        raw: true,
                        where: { storage_id: storageId, product_id:element.productId}
                    });
                    return element.quantity = productStorage.quantity
                })
            )
            
        }

        res.json({ paginationOptions: { totalRecords, current_page }, supplyProducts: data, status: "success" });
    
    }catch (err){
        console.log(err)
    }
})


supplyProduct.get('/supplytypeproducts/:id', async (req, res) => {
    try {
        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page?page:1;
        let supplyTypeId = req.params.id;
        let totalRecords = 0;

        let orderBy = req.query.orderBy;
        let orderType = req.query.orderType;
        if(!orderBy || orderBy == null || orderBy == undefined || orderBy  == '' ){
            orderBy = 'productName'
        }
        if(!orderType || orderType == null || orderType == undefined || orderType  == '' ){
            orderType = 'ASC'
        }
        const options = {
            limit, 
            offset,
            include: [
                { model: supplyNameModel, required: true,  where: { isDeleted: "0",supplyType_id:supplyTypeId}},
                { model: carModelsModel, required: false, include: [{ model: carBrandsModel, required: false }] },
                { model: releaseYearsModel, required: false },
                { model: companiesModel, required: false , }
            ],
            where: { isDeleted: "0"},
            order: [[Sequelize.col(orderBy), orderType]],
        };
    
        let supplyProducts = null;
        let storageId = req.query.storageId;
    
        if (storageId) { // storage selected
            const productStorages = await productStoragesModel.findAll({
                raw: true,
                where: { storage_id: storageId, }
            });
    
            if (productStorages.length > 0) {
                const productIds = productStorages.map(ps => ps.product_id);
                options.where.productId = productIds;
            } else {
                res.json({ message: "الرقم التعريفي للمخزن غير صحيح", status: "failed" });
                return;
            }
        }
    
        supplyProducts = await supplyProductModel.findAndCountAll(options);
        totalRecords = supplyProducts.count;
    
        if (supplyProducts.rows.length === 0) {
            res.json({ message: "لم يتم العثور على اى منتجات", status: "failed" });
            return;
        }
        const data  =  supplyProducts.rows.map((row) => ({
            ...row.toJSON(),
            supplyName: row.supplyname,
            carModel: row.carmodel,
            supplier: row.companie,
            carBrand:  row.carmodel?.carbrand
        }));

        if(storageId){
            await Promise.all(
                data.map( async (element) => {
                    let productStorage = await productStoragesModel.findOne({
                        raw: true,
                        where: { storage_id: storageId, product_id:element.productId}
                    });
                    return element.quantity = productStorage.quantity
                })
            )
            
        }

        res.json({ paginationOptions: { totalRecords, current_page }, supplyProducts: data, status: "success" });
    
    }catch (err){
        console.log(err)
    }
})

supplyProduct.get('/alldeletedsupplyproducts', async (req, res) => {
    let supplyproducts = await supplyProductModel.findAll({ raw: true, where: { isDeleted: "1" } });
    if (supplyproducts[0]) {
        res.json({ supplyproducts, status: "success" });
    }
    else {
        res.json({ message: "الأرشيف لا يوجد به منتجات", status: "failed" })
    }
})

// storages added for this api
supplyProduct.post('/addsupplyProduct/:id', async (req, res) => {
    //let productId = 1 ;
    let productStorages = null
    let storageId = req.query.storageId

    const { token, userId, productName,shortName, quantity, criticalQuantity,
        supplierId, piecePurchasePrice, piecePrice, productDescription,
        manufacturerCountery, barcode, releaseYear_id, carModel_id, productStoragesArr } = req.body
    let supplyNameId = req.params.id;
    let product;
    jwt.verify(token, 'admin', async (err, decodded) => {
        if (err) {
            res.json({ message: "error in token", status: "failed" })
        }
        else {
            let product = await supplyProductModel.findOne({ raw: true, where: { isDeleted: "0", productName } });
            if (product) {
                res.json({ message: "يوجد منتج بهذا الاسم بالفعل", status: "failed" })
            } else {
                //check if storages are valid
                if (productStoragesArr[0]) {
                    let isValidStorages = [] // to check if all storages exists
                    let totalProductStorageQuantity = 0
                    for (let i = 0; i < productStoragesArr.length; i++) {
                        let singleStorage = await storagesModal.findOne({ raw: true, where: { storageId: productStoragesArr[i].storageId, isDeleted: "0" } })
                        if (singleStorage) {
                            isValidStorages.push(true)
                            totalProductStorageQuantity = totalProductStorageQuantity + productStoragesArr[i].quantity
                        }
                    }
                    if (isValidStorages.length == productStoragesArr.length) { // all storages are valid
                        // check if quantity are ditriputed over storages correctly
                        if (totalProductStorageQuantity == quantity) {
                            let supplyName = await supplyNameModel.findOne({ raw: true, where: { supplyNameId, isDeleted: "0" } });
                            let carModel = await carModelsModel.findOne({ raw: true, where: { carModelId: carModel_id, isDeleted: "0" } });
                            let releaseYear = await releaseYearsModel.findOne({ raw: true, where: { releaseYearId: releaseYear_id, isDeleted: "0" } });
                            if (supplyName) {
                                let user = await userModel.findOne({ raw: true, where: { userId } });
                                if (user) {
                                    let addedAt = moment().format('YYYY-MM-DD HH:mm:ss');
                                    //let product = await supplyProductModel.findOne({raw:true , where:{productName}});
                                    if (releaseYear && carModel) {
                                        product = await supplyProductModel.create({ piecePurchasePrice, productName,shortName, carModel_id: carModel.carModelId, releaseYear_id: releaseYear.releaseYearId, supplyName_id: supplyName.supplyNameId, quantity, criticalQuantity, piecePrice, productDescription, manufacturerCountery, barcode, addedAt });

                                    }
                                    else if (releaseYear) {
                                        product = await supplyProductModel.create({ piecePurchasePrice, productName,shortName ,releaseYear_id: releaseYear.releaseYearId, supplyName_id: supplyName.supplyNameId, quantity, criticalQuantity, piecePrice, productDescription, manufacturerCountery, barcode, addedAt });

                                    }
                                    else if (carModel) {
                                        product = await supplyProductModel.create({ piecePurchasePrice, productName,shortName , carModel_id: carModel.carModelId, supplyName_id: supplyName.supplyNameId, quantity, criticalQuantity, piecePrice, productDescription, manufacturerCountery, barcode, addedAt });
                                    }
                                    else {
                                        product = await supplyProductModel.create({ piecePurchasePrice, productName,shortName , supplyName_id: supplyName.supplyNameId, quantity, criticalQuantity, piecePrice, productDescription, manufacturerCountery, barcode, addedAt });
                                    }
                                    if (product) {
                                        product = await supplyProductModel.findOne({ raw: true, where: { productId: product.productId } });

                                        for (let i = 0; i < productStoragesArr.length; i++) {
                                            productStorages = await productStoragesModel.create({ product_id: product.productId, quantity: productStoragesArr[i].quantity, storage_id: productStoragesArr[i].storageId });
                                        }
                                        if (supplierId != '' && supplierId != null) {
                                            let supplier = await companiesModel.findOne({ raw: true, where: { companyId: supplierId, type: "supplier" } });
                                            if (supplier) {
                                                await supplyProductModel.update({ supplier_id: supplier.companyId }, { where: { productId: product.productId } });
                                            }
                                            else {
                                                res.json({ message: "خطأ فى الرقم التعريفي للمورِد" })
                                            }
                                        }
                                        product = await supplyProductModel.findOne({ raw: true, where: { productId: product.productId } });
                                        let totalFees = quantity * (product.piecePurchasePrice);
                                        creationDate = moment().format('YYYY-MM-DD HH:mm:ss');
                                        await sessionModel.create({ user_id: user.userId, creationDate, isOrderConfirmed: '1' });
                                        let session = await sessionModel.findOne({ raw: true, where: { user_id: user.userId, creationDate } });
                                        let invoice = await invoicesModel.create({ session_id: session.sessionId, creationDate, type: "expense", supplyProduct_id: product.productId, quantity, totalFees, product: product })
                                        res.json({ status: "success", message: "تمت اضافة المنتج بنجاح", product, invoice })
                                    }
                                    else {
                                        res.json({ status: "failed", message: "هناك مشكلة ف التسجيل" })
                                    }

                                }
                                else {
                                    res.json({ message: "خطأ في رقم المستخدم او المستخدم غير موجود", status: "failed" });
                                }
                            }
                            else {
                                res.json({ message: "خطأ فى الرقم التعريفي لإسم القطعة", status: "failed" })
                            }
                        } else {
                            res.json({ message: "الكمية الاجمالية ليست موزعة بشكل صحيح على المخازن", status: "failed" });
                        }


                    } else {
                        res.json({ message: "خطأ في المخازن المختارة", status: "failed" })
                    }
                } else {
                    res.json({ message: "من فضلك ادخل توزيعة المخازن", status: "failed" })
                }
            }


        }

    })
})
supplyProduct.patch('/increaseproductquantity/:id', async (req, res) => {
    const { quantity, userId } = req.body
    let productId = req.params.id;
    let productStorage = null
    let storageId = req.query.storageId
    if (storageId) {
        let product = await supplyProductModel.findOne({ raw: true, where: { productId } });
        if (product) {
            let user = await userModel.findOne({ raw: true, where: { userId } });
            productStorage = await productStoragesModel.findOne({
                raw: true,
                where: { storage_id: storageId, product_id: productId }
            })
            if (productStorage) {
                if (user) {
                    //console.log(product);
                    creationDate = moment().format('YYYY-MM-DD HH:mm:ss');
                    await sessionModel.create({ user_id: user.userId, creationDate, isOrderConfirmed: '1' });
                    let session = await sessionModel.findOne({ raw: true, where: { user_id: user.userId, creationDate } });
                    let totalFees = quantity * (product.piecePurchasePrice);
                    let invoice = await invoicesModel.create({ session_id: session.sessionId, creationDate, type: "expense", supplyProduct_id: product.productId, quantity, totalFees, product: product, storage_id: storageId })
                    productStorage = await productStoragesModel.update({ quantity: productStorage.quantity + quantity }, { where: { storage_id: storageId, product_id: productId } });
                    product = await supplyProductModel.update({ quantity: product.quantity + quantity }, { where: { productId: product.productId } });
                    res.json({ message: "تم زيادة الكمية بنجاح", invoice, status: "success" })
                }
                else {
                    res.json({ message: "هذا المستخدم غير موجود", status: "failed" });
                }
            } else {
                res.json({ message: "هذا المنتج غير موجود في المخزن المختار  ", status: "failed" });
            }


        }
        else {
            res.json({ message: "خطأ فى الرقم التعريفي للمنتج", status: "failed" });
        }
    } else {
        res.json({ message: "خطأ فى الرقم التعريفي للمخزن", status: "failed" });
    }

})
supplyProduct.patch('/deletesupplyproduct/:id', async (req, res) => {
    let productId = req.params.id;
    const { token } = req.body
    jwt.verify(token, 'admin', async (err, decodded) => {
        if (err) {
            res.json({ message: "error in token", status: "failed" })
        }
        else {
            let supplyProduct = await supplyProductModel.findOne({
                raw: true, where: {
                    [op.and]: [
                        { productId }, { isDeleted: '0' }
                    ]
                }
            });
            if (supplyProduct) {
                supplyProductModel.update({ isDeleted: '1' }, {
                    where: {
                        [op.and]: [
                            { productId }, { isDeleted: '0' }
                        ]
                    }
                })
                res.json({ message: "تم نقل المنتج للأرشيف بنجاح", status: "success" })
            }
            else {
                res.json({ message: " خطأ فى الرقم التعريفي للمنتج", status: "failed" })
            }
        }
    })
})

supplyProduct.patch('/deletesupplyproductFromStorage/:id', async (req, res) => {
    let productId = req.params.id;
    let storageId = req.query.storageId
    const { token } = req.body
    jwt.verify(token, 'admin', async (err, decodded) => {
        if (err) {
            res.json({ message: "error in token", status: "failed" })
        }
        else {

            let supplyProduct = await supplyProductModel.findOne({
                raw: true, where: {
                    [op.and]: [
                        { productId }, { isDeleted: '0' }
                    ]
                }
            });
            if (supplyProduct) {
                let singleStorage = await storagesModal.findOne({ raw: true, where: { storageId, isDeleted: "0" } })
               
                if(singleStorage){
                    let productStorage = await productStoragesModel.findOne({ raw: true, where: { storage_id: storageId, product_id: productId} });
                   
                    if(productStorage){
                        const quantity = productStorage.quantity
                        supplyProductModel.update({ quantity: supplyProduct.quantity - quantity }, {
                            where: { productId ,isDeleted: '0'  }
                        })
                        productStoragesModel.destroy({ where: { storage_id: storageId, product_id: productId} })
                        res.json({ message: "تم نقل المنتج للأرشيف بنجاح", status: "success" })

                    }else{
                        res.json({ message: "هذا المنتج غير موجود بهذا المخزن!", status: "failed" })
                    }
                    


                }else{
                    res.json({ message: "هذا المخزن غير موجود!", status: "failed" })
                }
            }
            else {
                res.json({ message: " خطأ فى الرقم التعريفي للمنتج", status: "failed" })
            }
            
           
        }
    })
})
supplyProduct.patch('/deleteMultiplesupplyproducts', async (req, res) => {
    const { token ,products} = req.body
    jwt.verify(token, 'admin', async (err, decodded) => {
        if (err) {
            res.json({ message: "error in token", status: "failed" })
        }
        else {
            
            supplyProductModel.update({ isDeleted: '1' }, {
                where: {
                     productId: { [op.in]: products }
                }
            })
            res.json({ message: "تم نقل المنتجات للأرشيف بنجاح", status: "success" })
        }
    })
})
supplyProduct.patch('/deleteMultiplesupplyproductsFromStorage', async (req, res) => {
    try{
        const { token, products } = req.body;
        const storageId = req.query.storageId
        jwt.verify(token, 'admin', async (err, decoded) => {
            if (err) {
                res.json({ message: "error in token", status: "failed" });
            } else {
                const productStorages = await productStoragesModel.findAll({
                    where: {
                        storage_id: storageId,
                        product_id: { [op.in]: products },
                    },
                });
    
                const productIds = productStorages.map((productStorage) => productStorage.product_id);
    
                const supplyProducts = await supplyProductModel.findAll({
                    where: {
                        productId: { [op.in]: productIds },
                        isDeleted: '0',
                    },
                });
    
                const updates = [];
                for (const supplyProduct of supplyProducts) {
                    const productStorage = productStorages.find((productStorage) => productStorage.product_id === supplyProduct.productId);
                    const quantity = productStorage.quantity;
    
                    const update = supplyProductModel.update(
                        { quantity: supplyProduct.quantity - quantity },
                        { where: { productId: supplyProduct.productId, isDeleted: '0' } }
                    );
    
                    updates.push(update);
                }
    
                const deletions = productStoragesModel.destroy({
                    where: {
                        storage_id: storageId,
                        product_id: { [op.in]: productIds },
                    },
                });
    
                await Promise.all([...updates, deletions]);
    
                res.json({ message: "تم حذف المنتجات من المخزن بنجاح", status: "success" });
            }
        });
    }catch(err){
        console.log(err)
    }

});

supplyProduct.patch('/undeletesupplyproduct/:id', async (req, res) => {
    let productId = req.params.id;
    const { token } = req.body
    jwt.verify(token, 'admin', async (err, decodded) => {
        if (err) {
            res.json({ message: "error in token", status: "failed" })
        }
        else {
            let supplyProduct = await supplyProductModel.findOne({
                raw: true, where: {
                    [op.and]: [
                        { productId }, { isDeleted: '1' }
                    ]
                }
            });
            if (supplyProduct) {
                supplyProductModel.update({ isDeleted: '0' }, {
                    where: {
                        [op.and]: [
                            { productId }, { isDeleted: '1' }
                        ]
                    }
                })
                res.json({ message: "تم استرجاع المنتج بنجاح", status: "success" })
            }
            else {
                res.json({ message: "خطأ فى الرقم التعريفي للمنتج", status: "failed" })
            }
        }
    })
})
supplyProduct.delete("/permenantdeletesupplyProduct/:id", async (req, res) => {
    const { token } = req.body;
    let productId = req.params.id;
    jwt.verify(token, 'admin', async (err, decodded) => {
        if (err) {
            res.json({ message: "error in token", status: "failed" })
        }
        else {
            let supplyProduct = await supplyNameModel.findOne({ raw: true, where: { productId } });

            if (supplyProduct) {
                supplyProductModel.destroy({ where: { productId } })
                res.json({ message: "تم مسح المنتج نهائياً", status: "success" })
            }
            else {
                res.json({ message: "خطأ فى الرقم التعريفي للمنتج", status: "failed" });
            }
        }
    })
})
supplyProduct.put("/editproduct/:id",
    check('productName').not().isEmpty(),
    check('quantity').not().isEmpty(),
    check('piecePrice').not().isEmpty(),
    check('piecePurchasePrice').not().isEmpty(),
    check('criticalQuantity').not().isEmpty()
    , async (req, res) => {
        const { productName,shortName , productDescription, carModel_id, manufacturerCountery, releaseYear_id, supplyNameId, quantity, piecePrice, supplierId, piecePurchasePrice, criticalQuantity } = req.body;
        let productId = req.params.id;
        let product = await supplyProductModel.findOne({ raw: true, where: { productId, isDeleted: "0" } })
        if (product) {
            const errors = validationResult(req);
            if (errors.isEmpty()) {
                let modifiedAt = moment().format('YYYY-MM-DD HH:mm:ss');
                try {
                    product = await supplyProductModel.update({
                        productName: productName,shortName:shortName, productDescription: productDescription,
                        manufacturerCountery: manufacturerCountery,
                        releaseYear_id: releaseYear_id ? releaseYear_id : null,
                        supplyName_id: supplyNameId ? supplyNameId : null,
                        carModel_id: carModel_id ? carModel_id : null,
                        piecePrice: piecePrice, quantity: quantity, criticalQuantity: criticalQuantity,
                        supplier_id: supplierId ? supplierId : null,
                        piecePurchasePrice: piecePurchasePrice, modifiedAt: modifiedAt
                    }, { where: { productId: product.productId } });
                } catch (err) {

                }

                res.json({ message: "تم تعديل المنتج بنجاح", status: "success" });
            }
            else {
                res.json({ errors: errors.array(), status: "failed" })
            }
        }
        else {
            res.json({ message: "خطأ فى الرقم التعريفي للمنتج", status: "failed" })
        }
    })
supplyProduct.get('/criticalquantityproducts', async (req, res) => {
   

    try {
        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page?page:1;
        let totalRecords = 0;
        
        let orderBy = req.query.orderBy;
        let orderType = req.query.orderType;
        if(!orderBy || orderBy == null || orderBy == undefined || orderBy  == '' ){
            orderBy = 'productName'
        }
        if(!orderType || orderType == null || orderType == undefined || orderType  == '' ){
            orderType = 'ASC'
        }
        const options = {
            limit, 
            offset,
            include: [
                { model: supplyNameModel, required: true, },
                { model: carModelsModel, required: false, include: [{ model: carBrandsModel, required: false }] },
                { model: releaseYearsModel, required: false },
                { model: companiesModel, required: false , }
            ],
            where: { isDeleted: "0",
            quantity : {
                [op.lte]: Sequelize.col('criticalQuantity')
            } },
            order: [[Sequelize.col(orderBy), orderType]],
        };
    
        let supplyProducts = null;
        let storageId = req.query.storageId;

        let data  =  []
    
        if (storageId) { // storage selected
            const productStorages = await productStoragesModel.findAll({
                raw: true,
                where: { storage_id: storageId }
            });
    
            if (productStorages.length > 0) {
                const productIds = productStorages.map(ps => ps.product_id);
                //options.where.productId = productIds;

                delete options.where.quantity
                options.where = {
                    productId : productIds,
                    isDeleted: "0",
                    [op.and]: [
                        Sequelize.literal(`EXISTS (SELECT 1 FROM productstorages WHERE storage_id = ${storageId} AND product_id = ${Sequelize.col('productId').col} AND quantity <= ${Sequelize.col('criticalQuantity').col})`)
                    ]
                }
    
                supplyProducts = await supplyProductModel.findAndCountAll(options);
                totalRecords = supplyProducts.count;
    
    
    
                await Promise.all(
                    data =  supplyProducts.rows.map((row) => ({
                        ...row.toJSON(),
                        supplyName: row.supplyname,
                        carModel: row.carmodel,
                        supplier: row.companie,
                        carBrand:  row.carmodel?.carbrand
                    }))
                )

            } else {
                res.json({ message: "الرقم التعريفي للمخزن غير صحيح", status: "failed" });
                return;
            }

            


        }else{
            supplyProducts = await supplyProductModel.findAndCountAll(options);
            totalRecords = supplyProducts.count;
       
           if (supplyProducts.rows.length === 0) {
               res.json({ message: "لم يتم العثور على اى منتجات", status: "failed" });
               return;
           }

           data = supplyProducts.rows.map((row) => ({
            ...row.toJSON(),
            supplyName: row.supplyname,
            carModel: row.carmodel,
            supplier: row.companie,
            carBrand:  row.carmodel?.carbrand
        }));
        }
    
        

        res.json({ paginationOptions: { totalRecords, current_page }, supplyProducts: data, status: "success" });
    
    }catch (err){
        console.log(err)
    }
});


supplyProduct.get('/iscritical/:id', async (req, res) => {
    let productId = req.params.id;
    let product = await supplyProductModel.findOne({ raw: true, where: { productId } });
    if (product) {
        if (product.quantity <= product.criticalQuantity) {
            res.json({ message: "من النواقص", product });
        }
        else {
            res.json({ message: "ليس من النواقص", product })
        }
    }
    else {
        res.json({ message: "خطأ فى الرقم التعريفي للمنتج" })
    }
})


supplyProduct.get('/searchproducts', async (req, res) => {
    try{
        const searchKey = req.query.searckquery;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;
        const current_page = page?page:1;
        let totalRecords = 0;
        const storageId = req.query.storageId;
        
        let orderBy = req.query.orderBy;
        let orderType = req.query.orderType;
        if(!orderBy || orderBy == null || orderBy == undefined || orderBy  == '' ){
            orderBy = 'productName'
        }
        if(!orderType || orderType == null || orderType == undefined || orderType  == '' ){
            orderType = 'ASC'
        }
        
        let supplyProducts = null;

        let whereClause = {
            isDeleted: '0',
            [op.or]: [
                Sequelize.where(Sequelize.fn('concat', Sequelize.col('productName'), ' ', Sequelize.col('manufacturerCountery')), {
                    [op.like]: `%${searchKey}%`
                }),
                { productName: { [op.like]: `%${searchKey}%` } },
                { barcode: { [op.like]: `%${searchKey}%` } },
            ],
        };

        if (storageId) {

            let productStorages = await productStoragesModel.findAll({
                raw: true,
                where: { storage_id:storageId },
            });

            if (productStorages.length > 0) {
                const productIds = productStorages.map(p => p.product_id);
                whereClause = {
                    isDeleted: '0',
                    [op.or]: [
                        Sequelize.where(Sequelize.fn('concat', Sequelize.col('productName'), ' ', Sequelize.col('manufacturerCountery')), {
                            [op.like]: `%${searchKey}%`
                        }),
                        { productName: { [op.like]: `%${searchKey}%` } },
                        { barcode: { [op.like]: `%${searchKey}%` } },
                    ],
                    productId: { [op.in]: productIds }
                };
            } else {
                return res.json({ message: 'لم يتم العثور على اى منتجات', status: 'failed' });
            }
        }


        const options = {
            where: whereClause,
            include: [
            { model: supplyNameModel },
            { model: carModelsModel, include: [{ model: carBrandsModel }] },
            { model: releaseYearsModel },
            { model: companiesModel },
            ],
            limit,
            offset,
            order: [[Sequelize.col(orderBy), orderType]],
        };


        supplyProducts = await supplyProductModel.findAndCountAll(options);
        totalRecords = supplyProducts.count;
    

        if (supplyProducts.rows.length == 0) {
            return res.json({ message: 'لم يتم العثور على اى منتجات', status: 'failed' });
        }

        const result = supplyProducts.rows.map((p) => ({
            ...p.toJSON(),
        }));


        const data  =  supplyProducts.rows.map((row) => ({
            ...row.toJSON(),
            supplyName: row.supplyname,
            carModel: row.carmodel,
            supplier: row.companie,
            carBrand:  row.carmodel?.carbrand
        }));

        if(storageId){
            await Promise.all(
                data.map( async (element) => {
                    let productStorage = await productStoragesModel.findOne({
                        raw: true,
                        where: { storage_id: storageId, product_id:element.productId}
                    });
                    return element.quantity = productStorage.quantity
                })
            )
            
        }

        return res.json({ paginationOptions: { totalRecords, current_page }, supplyProducts: data, status: 'success' });
    }catch(err){
        console.log(err)
    }
});

supplyProduct.get('/searchShortagesProducts', async (req, res) => {
    try{
        const searchKey = req.query.searckquery;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;
        const current_page = page?page:1;
        let totalRecords = 0;
        const storageId = req.query.storageId;

        let orderBy = req.query.orderBy;
        let orderType = req.query.orderType;
        if(!orderBy || orderBy == null || orderBy == undefined || orderBy  == '' ){
            orderBy = 'productName'
        }
        if(!orderType || orderType == null || orderType == undefined || orderType  == '' ){
            orderType = 'ASC'
        }
        let supplyProducts = null;

        let whereClause = {
            isDeleted: '0',
            [op.or]: [
                Sequelize.where(Sequelize.fn('concat', Sequelize.col('productName'), ' ', Sequelize.col('manufacturerCountery')), {
                    [op.like]: `%${searchKey}%`
                }),
                { productName: { [op.like]: `%${searchKey}%` } },
                { barcode: { [op.like]: `%${searchKey}%` } },
            ],
            quantity : {
                [op.lte]: Sequelize.col('criticalQuantity')
            } 
        };

        if (storageId) {

            let productStorages = await productStoragesModel.findAll({
                raw: true,
                where: { storage_id:storageId },
            });

            if (productStorages.length > 0) {
                const productIds = productStorages.map(p => p.product_id);
                delete whereClause.quantity
                
                whereClause = {
                    isDeleted: '0',
                    [op.or]: [
                        Sequelize.where(Sequelize.fn('concat', Sequelize.col('productName'), ' ', Sequelize.col('manufacturerCountery')), {
                            [op.like]: `%${searchKey}%`
                        }),
                        { productName: { [op.like]: `%${searchKey}%` } },
                        { barcode: { [op.like]: `%${searchKey}%` } },
                    ],
                    productId: { [op.in]: productIds },
                    [op.and]: [
                        Sequelize.literal(`EXISTS (SELECT 1 FROM productstorages WHERE storage_id = ${storageId} AND product_id = ${Sequelize.col('productId').col} AND quantity <= ${Sequelize.col('criticalQuantity').col})`)
                    ]
                };
            } else {
                return res.json({ message: 'لم يتم العثور على اى منتجات', status: 'failed' });
            }
        }


        const options = {
            where: whereClause,
            include: [
            { model: supplyNameModel },
            { model: carModelsModel, include: [{ model: carBrandsModel }] },
            { model: releaseYearsModel },
            { model: companiesModel },
            ],
            limit,
            offset,
            order: [[Sequelize.col(orderBy), orderType]],
        };


        supplyProducts = await supplyProductModel.findAndCountAll(options);
        totalRecords = supplyProducts.count;
    

        if (supplyProducts.rows.length == 0) {
            return res.json({ message: 'لم يتم العثور على اى منتجات', status: 'failed' });
        }

        const result = supplyProducts.rows.map((p) => ({
            ...p.toJSON(),
        }));


        const data  =  supplyProducts.rows.map((row) => ({
            ...row.toJSON(),
            supplyName: row.supplyname,
            carModel: row.carmodel,
            supplier: row.companie,
            carBrand:  row.carmodel?.carbrand
        }));

        if(storageId){
            await Promise.all(
                data.map( async (element) => {
                    let productStorage = await productStoragesModel.findOne({
                        raw: true,
                        where: { storage_id: storageId, product_id:element.productId}
                    });
                    return element.quantity = productStorage.quantity
                })
            )
            
        }

        return res.json({ paginationOptions: { totalRecords, current_page }, supplyProducts: data, status: 'success' });
    }catch(err){
        console.log(err)
    }
});

supplyProduct.get('/checkbarcode/:barcode', async (req, res) => {
    let barcode = req.params.barcode;
    let product = await supplyProductModel.findOne({ raw: true, where: { barcode } });
    if (product) {
        res.json({ message: "المنتج موجود", product, status: "success" });
    }
    else {
        res.json({ message: "الباركود غير صحيح", status: "failed" })
    }
})
module.exports = supplyProduct;