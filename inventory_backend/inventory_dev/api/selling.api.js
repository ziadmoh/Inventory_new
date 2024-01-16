const sell = require('express').Router();
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
const releaseYearsModel = require('../models/releaseYear.model');
const sessionModel = require('../models/sessions.model');
const orderItemModel = require('../models/orderItems.model')
const userModel = require('../models/user.model');
const invoicesModel = require("../models/invoices.model");
const compainesModel = require("../models/compaines.model");
const { where } = require('sequelize');
const paymentModel = require('../models/payment.model');
const productStoragesModel = require('../models/productStorages.model');
const returningIvoiceModel= require("../models/returningInvoices.model")
const storagesModel = require('../models/storages.model');
const op = Sequelize.Op

sell.post('/opensession/:id', async (req, res) => {
    let userId = req.params.id
    let storage_id = req.query.storageId;
    if(storage_id){
            let user = await userModel.findOne({ raw: true, where: { userId }, attributes: { exclude: ['password'] } });
            if (user) {
                let session = await sessionModel.findOne({ raw: true, where: { user_id: userId, isOrderConfirmed: '0',storage_id } })
                if (!session) {
                    let creationDate = moment().format('YYYY-MM-DD HH:mm:ss');
                    let session = await sessionModel.create({ user_id: userId, creationDate,storage_id });
                    await sessionModel.findOne({ raw: true, where: { user_id: userId,storage_id } });
                    session.user = user
                    res.json({ message: "sessionCreatedSuccsefully", status: "success", session })

                }
                else {
                    res.json({ message: " can't open two parallel sessions", status: "failed" })
                }

            }
            else {
                res.json({ message: "invalid userId", status: "failed" })
            }
    }else{
        res.json({ message: "من فضلك اختر مخزن", status: "failed" })
    }
})
//sessionBysessionId
sell.get('/session/:id', async (req, res) => {
    let sessionId = req.params.id
    let session = await sessionModel.findOne({ raw: true, where: { sessionId } });
    if (session) {
        let user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
        session.user = user;
        res.json({ session, status: "success" });
    }
    else {
        res.json({ message: "خطأ فى رقم الجلسة", status: "failed" });
    }
})
//session by userId
sell.get('/usersessions/:id', async (req, res) => {
    let userId = req.params.id
    let storage_id = req.query.storageId;
    if(storage_id){
        let user = await userModel.findOne({ raw: true, where: { userId }, attributes: { exclude: ['password'] } });
        if (user) {
            let session = await sessionModel.findOne({ raw: true, where: { user_id: user.userId, isOrderConfirmed: '0',storage_id } });
            if (session) {

                res.json({ session, status: "success" });
            }
            else {
                res.json({ message: "لا يوجد جلسات لهذا المستخدم", status: "failed" })
            }
        }
        else {
            res.json({ message: "خطأ فى رقم المستخدم", status: "failed" });
        }
    }else {
        res.json({ message: "من فضلك اختر مخزن", status: "failed" });
    }
})
sell.post('/addorderitem/:id', async (req, res) => {
    const {quantity , productId}=req.body;
    let sessionId = req.params.id;
    let storage_id = req.query.storageId;
            if(storage_id){
                let session = await sessionModel.findOne({ raw: true, where: { sessionId, isOrderConfirmed: "0" } });
                if (session) {
                    let product = await supplyProductModel.findOne({ raw: true, where: { productId, quantity: { [op.gte]: quantity }, isDeleted: '0' } });
                    if (product) {
                        let productStorage = await productStoragesModel.findOne({raw:true , where:{storage_id,product_id:product.productId,quantity: { [op.gte]: quantity }}});
                        if(productStorage){
                            let orderItem = await orderItemModel.findOne({ raw: true, where: { session_id: session.sessionId, product_id: product.productId,storage_id } });
                            if (!orderItem) {
                                let fee = quantity * product.piecePrice;
                                orderItem = await orderItemModel.create({ product_id: productId, session_id: sessionId, fee, quantity ,product:product,storage_id});
                                await supplyProductModel.update({ quantity: product.quantity - quantity }, { where: { productId: product.productId } });
                                await productStoragesModel.update({ quantity: productStorage.quantity - quantity }, { where: { storage_id,product_id: product.productId } });
                                res.json({ message: "تمت اضافه المطلوب بنجاح", orderItem, status: "success" })
                            }
                            else {
                                res.json({ message: "مدخلة من قبل", status: "failed" })
                            }
                        }else{
                            res.json({ message: "المنتج غير موجود بهذا المخزن", status: "failed" })
                        }
                        
    
                    }
                    else {
                        res.json({ message: "لم يتم العثور على المنتج او عدد القطع في المخزن اقل من المطلوب", status: "failed" })
                    }
                }
                else {
                    res.json({ message: "خطأ فى رقم الجلسة", status: "failed" })
                }
            }else{
                res.json({ message: "من فضلك اختر مخزن", status: "failed" })
            }
            
      
})
//delete specific Order Item
sell.delete('/deleteorderitem/:id', async (req, res) => {
    let orderItemId = req.params.id;
    let storage_id = req.query.storageId;
        if(storage_id){
            let orderItem = await orderItemModel.findOne({ raw: true, where: { orderItemId } });
            
            if (orderItem) {
                let session = await sessionModel.findOne({ raw: true, where: { sessionId: orderItem.session_id, isOrderConfirmed: '0' } });
                if (session) {
                    await orderItemModel.destroy({ where: { orderItemId } });
                    let product = await supplyProductModel.findOne({ raw: true, where: { productId: orderItem.product_id } });
                    let productStorage = await productStoragesModel.findOne({raw:true , where:{storage_id,product_id:product.productId}})
                    await supplyProductModel.update({ quantity: product.quantity + orderItem.quantity }, { where: { productId: product.productId } });
                    await productStoragesModel.update({ quantity: productStorage.quantity + orderItem.quantity }, { where: { storage_id,product_id: product.productId } });
                    res.json({ message: "تم مسح المطلوب بنجاح", status: "success" })
                }
                else {
                    res.json({ message: "الجلسة منتهية", status: "failed" })
                }
            }
            else {
                res.json({ message: "خطأ فى رقم المطلوب", status: "failed" })
            }
        }else{
            res.json({ message: "من فضلك اختر مخزن", status: "failed" })
        }
})
//delete all session orderItems
sell.delete('/deletesessionorderitems/:id', async (req, res) => {
    let sessionId = req.params.id;
    let product;
    let storage_id=req.query.storageId
            if(storage_id){
            let session = await sessionModel.findOne({ raw: true, where: { sessionId, isOrderConfirmed: '0',storage_id } });
            if (session) {
                let orderItems = await orderItemModel.findAll({ raw: true, where: { session_id: session.sessionId,storage_id } });
                if (orderItems[0]) {
                    for (let i = 0; i < orderItems.length; i++) {
                        product = await supplyProductModel.findOne({ raw: true, where: { productId: orderItems[i].product_id } });
                        let productStorage = await productStoragesModel.findOne({raw:true , where:{product_id:product.productId,storage_id}})
                        if(productStorage){
                            await supplyProductModel.update({ quantity: product.quantity + orderItems[i].quantity }, { where: { productId: product.productId } });
                            await productStoragesModel.update({ quantity: productStorage.quantity + orderItems[i].quantity }, { where: {storage_id, product_id: product.productId } });
                        }
                    }
                    await orderItemModel.destroy({ where: { session_id: session.sessionId } });
                    res.json({ message: "تم مسح جميع المطلوبات فى هذه الجلسة بنجاح", status: "success" })
                }
                else {
                    res.json({ message: "لا يوجد مطلوبات فى هذه الجلسة", status: "failed" })
                }
            }
            else {
                res.json({ message: " خطأ فى رقم الجلسة او الجلسة منتهية", status: "failed" })
            }

        }else{
            res.json({ message: "من فضلك اختر مخزن", status: "failed" })
        }
      
})
//edit quantity
sell.patch('/editorderitem/:id', async (req, res) => {
    let orderItemId = req.params.id;
    let storage_id = req.query.storageId;
    const { quantity } = req.body
    
    if(storage_id){
        let product;
            let orderItem = await orderItemModel.findOne({ raw: true, where: { storage_id, orderItemId } });
            
            if (orderItem) {
                let session = await sessionModel.findOne({ raw: true, where: { storage_id,sessionId: orderItem.session_id, isOrderConfirmed: '0' } });
                if (session) {
                    product = await supplyProductModel.findOne({ raw: true, where: { productId: orderItem.product_id } });
                    
                        
                    if (product) {
                        let productStorage = await productStoragesModel.findOne({raw:true , where:{storage_id,product_id:product.productId}})
                        
                        if(productStorage){
                            if( (orderItem.quantity + productStorage.quantity) >= quantity){
                                
                                let fee = quantity * product.piecePrice;
                                await supplyProductModel.update({ quantity: (product.quantity + orderItem.quantity) - quantity }, { where: { productId: product.productId } })
                                
                                await productStoragesModel.update({ quantity: (productStorage.quantity + orderItem.quantity) - quantity }, { where: { storage_id,product_id: product.productId } });
                                await orderItemModel.update({ fee, quantity }, { where: { orderItemId,storage_id } });
                                
                                product = await supplyProductModel.findOne({ raw: true, where: { productId: product.productId } });
                                orderItem = await orderItemModel.findOne({ raw: true, where: { orderItemId } });
                                res.json({ message: "تم تعديل الكمية بنجاح", orderItem, status: "success" });

                            }else{
                                res.json({ message: "عدد القطع المطلوبة اكتر من الموجود",orderItem })
                            }
                        }else{
                            res.json({ message: "المنتج غير موجود بهذا المخزن",status:"failed" })
                        }
                       
                        // await supplyProductModel.update({ quantity: (product.quantity + orderItem.quantity) }, { where: { productId: product.productId } })
                        // await productStoragesModel.update({ quantity: productStorage.quantity + orderItem.quantity }, { where: { storage_id,product_id: product.productId } });
                        // product = await supplyProductModel.findOne({ raw: true, where: { productId: orderItem.product_id, quantity: { [op.gte]: quantity } } });
                        // if(product){
                        //     productStorage = await productStoragesModel.findOne({raw:true , where:{product_id:product.productId,storage_id,quantity: { [op.gte]: quantity }}});
                        // }
                        // if (product && productStorage) {
                        //     let fee = quantity * product.piecePrice;
                        //     await orderItemModel.update({ fee, quantity }, { where: { orderItemId,storage_id } });
                        //     await supplyProductModel.update({ quantity: product.quantity - quantity }, { where: { productId: product.productId } })
                        //     await productStoragesModel.update({ quantity: productStorage.quantity - quantity }, { where: { storage_id,product_id: product.productId } });
                        //     product = await supplyProductModel.findOne({ raw: true, where: { productId: product.productId } });
                        //     orderItem = await orderItemModel.findOne({ raw: true, where: { orderItemId } });
                        //     res.json({ message: "تم تعديل الكمية بنجاح", orderItem, status: "success" });
                        // }
                        // else {
                        //     product = await supplyProductModel.findOne({ raw: true, where: { productId: orderItem.product_id } });
                        //     await supplyProductModel.update({ quantity: (product.quantity - orderItem.quantity) }, { where: { productId: product.productId } })
                        //     await productStoragesModel.update({ quantity: productStorage.quantity - orderItem.quantity }, { where: { storage_id,product_id: product.productId } });
                        //     res.json({ message: "عدد القطع المطلوبة اكتر من الموجود",orderItem })
                        // }

                    }
                    else {
                        res.json({ message: "هذا المنتج غير موجود بالمخزن!",orderItem })
                    }
                }
                else {
                    res.json({ message: "الجلسة منتهية", status: "failed" })
                }
            }
            else {
                res.json({ message: "خطأ فى رقم المطلوب", status: "failed" })
            }
    }else{
        res.json({ message: "من فضلك اختر مخزن", status: "failed" })
    }
})
//orderItem by orderItem id 
sell.get("/orderitem/:id", async (req, res) => {
    let orderItemId = req.params.id;
    let orderItem = await orderItemModel.findOne({ raw: true, where: { orderItemId } });
    if (orderItem) {
        let session = await sessionModel.findOne({ raw: true, where: { sessionId: orderItem.session_id } });
        let user = await userModel.findOne({ raw: true, where: { userId: session.user_id, isDeleted: '0' }, attributes: { exclude: ['password'] } });
        orderItem.session = session;
        let product = await supplyProductModel.findOne({ raw: true, where: { productId: orderItem.product_id, isDeleted: '0' } });
        let carModel = await carModelsModel.findOne({ raw: true, where: { carModelId: product.carModel_id } });
        //orderItem.product = product
        if (carModel) {
            let carBrand = await carBrandsModel.findOne({ raw: true, where: { carBrandId: carModel.carBrand_id } });
            orderItem.carModel = carModel;
            orderItem.carBrand = carBrand;
        }
        let releaseYear = await releaseYearsModel.findOne({ raw: true, where: { releaseYearId: product.releaseYear_id } });

        orderItem.releaseYear = releaseYear;
        orderItem.user = user;
        res.json({ orderItem, product :JSON.parse(orderItem.product) ,status: "success"})
    }
    else {
        res.json({ message: "خطأ فى رقم الطلب", status: "failed" })
    }

})
//orderItem by session id
sell.get('/sessionorderitem/:id', async (req, res) => {
    let sessionId = req.params.id;
    let storage_id = req.query.storageId;
    if(storage_id){
        let session = await sessionModel.findOne({ raw: true, where: { sessionId } });
        if (session) {
            let user = await userModel.findOne({ raw: true, where: { userId: session.user_id, isDeleted: '0' }, attributes: { exclude: ['password'] } });
            let orderItems = await orderItemModel.findAll({ raw: true, where: { session_id: sessionId,storage_id } });
            
            let selectedorderItems =[]
            if (orderItems[0]) {
                for (let i = 0; i < orderItems.length; i++) {
                    let product = await supplyProductModel.findOne({ raw: true, where: { productId: orderItems[i].product_id, isDeleted: '0' } });
                
                    if(product){
                        let productStorage = await productStoragesModel.findOne({raw:true , where:{product_id:product.productId,storage_id:storage_id}})
                  
                        if(productStorage){
                            selectedorderItems.push(orderItems[i])
                        }
                    }
                }
                if(selectedorderItems[0]){
                    for (let i = 0; i < selectedorderItems.length; i++) {
                        let product = await supplyProductModel.findOne({ raw: true, where: { productId: selectedorderItems[i].product_id, isDeleted: '0' } });
                        let carModel = await carModelsModel.findOne({ raw: true, where: { carModelId: product.carModel_id } });
                        selectedorderItems[i].product = JSON.parse(selectedorderItems[i].product)
                        if (carModel) {
                            let carBrand = await carBrandsModel.findOne({ raw: true, where: { carBrandId: carModel.carBrand_id } });
                            selectedorderItems[i].carModel = carModel;
                            selectedorderItems[i].carBrand = carBrand;
                        }
                        let releaseYear = await releaseYearsModel.findOne({ raw: true, where: { releaseYearId: product.releaseYear_id } });
    
                        selectedorderItems[i].releaseYear = releaseYear;
                        selectedorderItems[i].user = user
                    }
                    
                    res.json({ orderItems:selectedorderItems, status: "success" })
                    
                }else{
                    res.json({ message: "لا يوجد عناصر", status: "failed" })
                }
                
            }
            else {
                res.json({ message: "لا يوجد عناصر", status: "failed" })
            }

        }
        else {
            res.json({ message: "الجلسة غير صحيحة", status: "failed" })
        }
    }else{
        res.json({ message: "من فضلك اختر مخزن", status: "failed" })
    }
})
sell.post('/generateinvoice/:id', async (req, res) => {
    let sessionId = req.params.id
    let storage_id = req.query.storageId;
    if(storage_id){
        let totalFees = 0;
        let session = await sessionModel.findOne({ raw: true, where: { sessionId, isOrderConfirmed: '0',storage_id } });
        if (session) {
            creationDate = moment().format('YYYY-MM-DD HH:mm:ss');
            let orderItems = await orderItemModel.findAll({ raw: true, where: { session_id: session.sessionId,storage_id } });
            if (orderItems[0]) {
                for (let i = 0; i < orderItems.length; i++) {
                    totalFees += orderItems[i].fee;
                }
                let invoice = await invoicesModel.create({ session_id: session.sessionId, totalFees,recievedFees:totalFees , creationDate, storage_id});
                await sessionModel.update({ isOrderConfirmed: '1' }, { where: { sessionId: session.sessionId,storage_id } });
                res.json({ message: "تم انشاء الفاتورة بنجاح", status: "success", invoice });
            }
            else {
                res.json({ message: "لم يتم ادخال طلبات", status: "failed" });
            }
            }
            else {
                res.json({ message: "invalid session Id", status: "falied" })
            }
    }else{
        res.json({ message: "من فضلك اختر مخزن", status: "failed" })
    }
      
})
//invoice by invoiceId
sell.get("/revenueinvoice/:id", async (req, res) => {
    let invoiceId = req.params.id;
    let invoice = await invoicesModel.findOne({ raw: true, where: { invoiceId, type: "revenue" } });
    if (invoice) {
        let session = await sessionModel.findOne({ raw: true, where: { sessionId: invoice.session_id } });
        let user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
        let orderItems = await orderItemModel.findAll({ raw: true, where: { session_id: session.sessionId } });
        if (orderItems[0]) {
            for (let i = 0; i < orderItems.length; i++) {
                let product = await supplyProductModel.findOne({ raw: true, where: { productId: orderItems[i].product_id, isDeleted: '0' } });
                let carModel = await carModelsModel.findOne({ raw: true, where: { carModelId: product.carModel_id } });
                orderItems[i].product = JSON.parse(orderItems[i].product)
                if (carModel) {
                    let carBrand = await carBrandsModel.findOne({ raw: true, where: { carBrandId: carModel.carBrand_id } });
                    orderItems[i].carModel = carModel;
                    orderItems[i].carBrand = carBrand;
                }
                let releaseYear = await releaseYearsModel.findOne({ raw: true, where: { releaseYearId: product.releaseYear_id } });

                orderItems[i].releaseYear = releaseYear;
                orderItems[i].user = user
            }
        }
        invoice.session = session;
        invoice.orderItems = orderItems;
        res.json({ invoice, status: "success" })
    }
    else {
        res.json({ message: "خطأ فى رقم الفاتورة", status: "failed" });
    }
})
//invoice by sessionId
sell.get("/sessioninvoices/:id", async (req, res) => {
    let sessionId = req.params.id;
    let session = await sessionModel.findOne({ raw: true, where: { sessionId } });
    if (session) {
        let user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
        let invoices = await invoicesModel.findAll({ raw: true, where: { session_id: session.sessionId, type: "revenue" } });
        if (invoices[0]) {
            for (let i = 0; i < invoices.length; i++) {
                let orderItems = await orderItemModel.findAll({ raw: true, where: { session_id: invoices[i].session_id } });
                if (orderItems[0]) {
                    for (let j = 0; j < orderItems.length; j++) {
                        let product = await supplyProductModel.findOne({ raw: true, where: { productId: orderItems[j].product_id, isDeleted: '0' } });
                        let carModel = await carModelsModel.findOne({ raw: true, where: { carModelId: product.carModel_id } });
                        orderItems[j].product = JSON.parse(orderItems[j].product)
                        if (carModel) {
                            let carBrand = await carBrandsModel.findOne({ raw: true, where: { carBrandId: carModel.carBrand_id } });
                            orderItems[j].carModel = carModel;
                            orderItems[j].carBrand = carBrand;
                        }
                        let releaseYear = await releaseYearsModel.findOne({ raw: true, where: { releaseYearId: product.releaseYear_id } });

                        orderItems[j].releaseYear = releaseYear;
                        orderItems[j].user = user
                    }
                    invoices[i].orderItems = orderItems;
                    invoices[i].session = session;
                }
            }
            res.json({ invoices, status: "success" });
        }
        else {
            res.json({ message: "لا يوجد فواتير فى هذه الجلسة", status: "failed" });
        }
    }
    else {
        res.json({ message: "خطأ فى رقم الجلسة", status: "failed" });
    }
})
//invoice by user id
sell.get("/userinvoices/:id", async (req, res) => {
    let userId = req.params.id;
    let user = await userModel.findOne({ raw: true, where: { userId } });
    let invoices;
    if (user) {
        let sessions = await sessionModel.findAll({ raw: true, where: { user_id: user.userId } });
        if (sessions[0]) {
            for (let i = 0; i < sessions.length; i++) {
                invoices = await invoicesModel.findAll({ raw: true, where: { session_id: sessions[i].sessionId, type: "revenue" } });
                if (invoices[0]) {
                    for (let j = 0; j < invoices.length; j++) {
                        let orderItems = await orderItemModel.findAll({ raw: true, where: { session_id: invoices[j].session_id } });
                        if (orderItems[0]) {
                            for (let o = 0; o < orderItems.length; o++) {
                                let product = await supplyProductModel.findOne({ raw: true, where: { productId: orderItems[o].product_id, isDeleted: '0' } });
                                let carModel = await carModelsModel.findOne({ raw: true, where: { carModelId: product.carModel_id } });
                                orderItems[o].product = product
                                if (carModel) {
                                    let carBrand = await carBrandsModel.findOne({ raw: true, where: { carBrandId: carModel.carBrand_id } });
                                    orderItems[o].carModel = carModel;
                                    orderItems[o].carBrand = carBrand;
                                }
                                let releaseYear = await releaseYearsModel.findOne({ raw: true, where: { releaseYearId: product.releaseYear_id } });

                                orderItems[o].releaseYear = releaseYear;
                                orderItems[o].user = user
                            }
                            invoices[j].orderItems = orderItems;
                            invoices[j].user = user;
                        }
                    }
                }
            }
            res.json({ invoices, status: "success" });
        }

        else {
            res.json({ message: "خطأ فى رقم الجلسة", status: "failed" });
        }
    }
    else {
        res.json({ message: "خطأ فى رقم المستخدم", status: "failed" });
    }
})
//all revenue invoices
sell.get("/revenueInvoices", async (req, res) => {
    try {
        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;
        let totalRecords = 0;

        const options = {
            raw: true,
            limit,
            offset,
            where: { type: "revenue" },
            order: [['creationDate', 'DESC']],
        };

        let storage_id = req.query.storageId;

        if (storage_id) {
            options.where.storage_id = storage_id;
        }

        const invoices = await invoicesModel.findAndCountAll(options);
        totalRecords = invoices.count;

        if (invoices.rows.length === 0) {
            res.json({ message: "لا يوجد فواتير مبيعات", status: "failed" });
            return;
        }

        const data = invoices.rows.map(async (invoice) => {
            let orderItems = null
            let session = null
            let storage = null
            if(storage_id){
                orderItems = await orderItemModel.findAll({
                    raw: true,
                    where: { session_id: invoice.session_id, storage_id },
                });
    
                session = await sessionModel.findOne({
                    raw: true,
                    where: { sessionId: invoice.session_id, storage_id },
                });
    
                storage = await storagesModel.findOne({
                    raw: true,
                    where: { storageId: invoice.storage_id },
                });
            }else{

                orderItems = await orderItemModel.findAll({
                    raw: true,
                    where: { session_id: invoice.session_id, storage_id: invoice.storage_id},
                });
    
                session = await sessionModel.findOne({
                    raw: true,
                    where: { sessionId: invoice.session_id,storage_id: invoice.storage_id },
                });
    
    
                storage = await storagesModel.findOne({
                    raw: true,
                    where: { storageId: invoice.storage_id },
                });
            }

            orderItems = orderItems.map((orderItem) => {
                orderItem.product = JSON.parse(orderItem.product);
                return orderItem;
            });

            const user = await userModel.findOne({
                raw: true,
                where: { userId: session.user_id },
                attributes: { exclude: ['password'] },
            });
            

            invoice.orderItems = orderItems;
            invoice.user = user;
            invoice.storage = storage;

            return invoice;
        });

        const result = await Promise.all(data);
        
        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('totalFees')), 'totalSum'],
            ],
            where: { type: "revenue" },
        };

        if (storage_id) {
            totalOptions.where.storage_id = storage_id;
        }

        const totals = await invoicesModel.findAll(totalOptions);
        res.json({
            totalSum:totals[0].totalSum,
            paginationOptions: { totalRecords, current_page },
            invoices: result,
            status: "success",
        });

    } catch (err) {
        console.log(err);
    }
});

//today revenue invoices
sell.get("/todayRevenueInvoices", async (req, res) => {
    try {
        var start = moment(new Date()).set({ "hour": 07, "minute": 00 })
        var end = moment(new Date())
        var duration = moment.duration(end.diff(start));
        var hours = duration.asHours();

        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;
        let totalRecords = 0;

        const options = {
            raw: true,
            limit,
            offset,
            where: { 
                type: "revenue",
                creationDate: { [op.gte]: moment().subtract(hours, 'hours').format('YYYY-MM-DD HH:mm:ss')} 
            },
            order: [['creationDate', 'DESC']],
        };

        let storage_id = req.query.storageId;

        if (storage_id) {
            options.where.storage_id = storage_id;
        }

        const invoices = await invoicesModel.findAndCountAll(options);
        totalRecords = invoices.count;

        if (invoices.rows.length === 0) {
            res.json({ message: "لا يوجد فواتير مبيعات", status: "failed" });
            return;
        }

        const data = invoices.rows.map(async (invoice) => {
            let orderItems = null
            let session = null
            let storage = null
            if(storage_id){
                orderItems = await orderItemModel.findAll({
                    raw: true,
                    where: { session_id: invoice.session_id, storage_id },
                });
    
                session = await sessionModel.findOne({
                    raw: true,
                    where: { sessionId: invoice.session_id, storage_id },
                });
    
                storage = await storagesModel.findOne({
                    raw: true,
                    where: { storageId: invoice.storage_id },
                });
            }else{

                orderItems = await orderItemModel.findAll({
                    raw: true,
                    where: { session_id: invoice.session_id, storage_id: invoice.storage_id},
                });
    
                session = await sessionModel.findOne({
                    raw: true,
                    where: { sessionId: invoice.session_id,storage_id: invoice.storage_id },
                });
    
    
                storage = await storagesModel.findOne({
                    raw: true,
                    where: { storageId: invoice.storage_id },
                });
            }

            orderItems = orderItems.map((orderItem) => {
                orderItem.product = JSON.parse(orderItem.product);
                return orderItem;
            });

            const user = await userModel.findOne({
                raw: true,
                where: { userId: session.user_id },
                attributes: { exclude: ['password'] },
            });
            

            invoice.orderItems = orderItems;
            invoice.user = user;
            invoice.storage = storage;

            return invoice;
        });

        const result = await Promise.all(data);

        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('totalFees')), 'totalSum'],
            ],
            where: { 
                type: "revenue",
                creationDate: { [op.gte]: moment().subtract(hours, 'hours').format('YYYY-MM-DD HH:mm:ss')} 
            },
        };

        if (storage_id) {
            totalOptions.where.storage_id = storage_id;
        }

        const totals = await invoicesModel.findAll(totalOptions);
        res.json({
            totalSum:totals[0].totalSum,
            paginationOptions: { totalRecords, current_page },
            invoices: result,
            status: "success",
        });

    } catch (err) {
        console.log(err);
    }
});
//last 7 days revenue invoices

sell.get("/last7DaysRevenueInvoices", async (req, res) => {
    try {

        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;
        let totalRecords = 0;

        const options = {
            raw: true,
            limit,
            offset,
            where: { 
                type: "revenue",
                creationDate:{ [op.gte]: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss') }
            },
            order: [['creationDate', 'DESC']],
        };

        let storage_id = req.query.storageId;

        if (storage_id) {
            options.where.storage_id = storage_id;
        }

        const invoices = await invoicesModel.findAndCountAll(options);
        totalRecords = invoices.count;

        if (invoices.rows.length === 0) {
            res.json({ message: "لا يوجد فواتير مبيعات", status: "failed" });
            return;
        }

        const data = invoices.rows.map(async (invoice) => {
            let orderItems = null
            let session = null
            let storage = null
            if(storage_id){
                orderItems = await orderItemModel.findAll({
                    raw: true,
                    where: { session_id: invoice.session_id, storage_id },
                });
    
                session = await sessionModel.findOne({
                    raw: true,
                    where: { sessionId: invoice.session_id, storage_id },
                });
    
                storage = await storagesModel.findOne({
                    raw: true,
                    where: { storageId: invoice.storage_id },
                });
            }else{

                orderItems = await orderItemModel.findAll({
                    raw: true,
                    where: { session_id: invoice.session_id, storage_id: invoice.storage_id},
                });
    
                session = await sessionModel.findOne({
                    raw: true,
                    where: { sessionId: invoice.session_id,storage_id: invoice.storage_id },
                });
    
    
                storage = await storagesModel.findOne({
                    raw: true,
                    where: { storageId: invoice.storage_id },
                });
            }

            orderItems = orderItems.map((orderItem) => {
                orderItem.product = JSON.parse(orderItem.product);
                return orderItem;
            });

            const user = await userModel.findOne({
                raw: true,
                where: { userId: session.user_id },
                attributes: { exclude: ['password'] },
            });
            

            invoice.orderItems = orderItems;
            invoice.user = user;
            invoice.storage = storage;

            return invoice;
        });

        const result = await Promise.all(data);

        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('totalFees')), 'totalSum'],
            ],
            where: { 
                type: "revenue",
                creationDate:{ [op.gte]: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss') }
            },
        };

        if (storage_id) {
            totalOptions.where.storage_id = storage_id;
        }

        const totals = await invoicesModel.findAll(totalOptions);
        res.json({
            totalSum:totals[0].totalSum,
            paginationOptions: { totalRecords, current_page },
            invoices: result,
            status: "success",
        });

    } catch (err) {
        console.log(err);
    }
});

sell.get("/last30DaysRevenueInvoices", async (req, res) => {
    try {

        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;
        let totalRecords = 0;

        const options = {
            raw: true,
            limit,
            offset,
            where: { 
                type: "revenue",
                creationDate:{ [op.gte]: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss') } 
            },
            order: [['creationDate', 'DESC']],
        };

        let storage_id = req.query.storageId;

        if (storage_id) {
            options.where.storage_id = storage_id;
        }

        const invoices = await invoicesModel.findAndCountAll(options);
        totalRecords = invoices.count;

        if (invoices.rows.length === 0) {
            res.json({ message: "لا يوجد فواتير مبيعات", status: "failed" });
            return;
        }

        const data = invoices.rows.map(async (invoice) => {
            let orderItems = null
            let session = null
            let storage = null
            if(storage_id){
                orderItems = await orderItemModel.findAll({
                    raw: true,
                    where: { session_id: invoice.session_id, storage_id },
                });
    
                session = await sessionModel.findOne({
                    raw: true,
                    where: { sessionId: invoice.session_id, storage_id },
                });
    
                storage = await storagesModel.findOne({
                    raw: true,
                    where: { storageId: invoice.storage_id },
                });
            }else{

                orderItems = await orderItemModel.findAll({
                    raw: true,
                    where: { session_id: invoice.session_id, storage_id: invoice.storage_id},
                });
    
                session = await sessionModel.findOne({
                    raw: true,
                    where: { sessionId: invoice.session_id,storage_id: invoice.storage_id },
                });
    
    
                storage = await storagesModel.findOne({
                    raw: true,
                    where: { storageId: invoice.storage_id },
                });
            }

            orderItems = orderItems.map((orderItem) => {
                orderItem.product = JSON.parse(orderItem.product);
                return orderItem;
            });

            const user = await userModel.findOne({
                raw: true,
                where: { userId: session.user_id },
                attributes: { exclude: ['password'] },
            });
            

            invoice.orderItems = orderItems;
            invoice.user = user;
            invoice.storage = storage;

            return invoice;
        });

        const result = await Promise.all(data);

        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('totalFees')), 'totalSum'],
            ],
            where: { 
                type: "revenue",
                creationDate:{ [op.gte]: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss') } 
            },
        };

        if (storage_id) {
            totalOptions.where.storage_id = storage_id;
        }

        const totals = await invoicesModel.findAll(totalOptions);
        res.json({
            totalSum:totals[0].totalSum,
            paginationOptions: { totalRecords, current_page },
            invoices: result,
            status: "success",
        });

    } catch (err) {
        console.log(err);
    }
});
//get expenses invoices
sell.get("/expenseinvoices", async (req, res) => {
    try {
        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;
        let totalRecords = 0;

        const options = {
            raw: true,
            limit,
            offset,
            where: { type: "expense" },
            order: [['creationDate', 'DESC']],
        };

        let storage_id = req.query.storageId;

        if (storage_id) {
            const storageProducts = await productStoragesModel.findAll({ raw: true, where: { storage_id } });
            if (storageProducts.length > 0) {
                const productIds = storageProducts.map(product => product.product_id);
                options.where.supplyProduct_id = { [op.in]: productIds };
            } else {
                res.json({ message: "هذا المنتج غير متاح في هذا المخزن", status: "failed" });
                return;
            }
        }

        const invoices = await invoicesModel.findAndCountAll(options);
        totalRecords = invoices.count;

        if (invoices.rows.length === 0) {
            res.json({ message: "لا يوجد فواتير شراء", status: "failed" });
            return;
        }

        const result = [];

        for (let i = 0; i < invoices.rows.length; i++) {
            const invoice = invoices.rows[i];

            let product = null;
            if (invoice.supplyProduct_id) {
                product = await supplyProductModel.findOne({ raw: true, where: { productId: invoice.supplyProduct_id } });
            }

            let storageProduct = null;
            let quantity = invoice.quantity;
            let totalFees = invoice.totalFees;
            if (storage_id && product) {
                storageProduct = await productStoragesModel.findOne({ raw: true, where: { storage_id, product_id: product.productId } });
                if (storageProduct) {
                    // quantity = storageProduct.quantity;
                    totalFees = product.piecePurchasePrice * quantity;
                }
            }

            let user = null;
            let session = null;
            if (invoice.session_id) {
                session = await sessionModel.findOne({ raw: true, where: { sessionId: invoice.session_id, storage_id:invoice.storage_id } });
                if (session) {
                    
                    
                    user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                }
            }

            let storage = null;
            if (storage_id) {
                storage = await storagesModel.findOne({ raw: true, where: { storageId: storage_id } });
            }

            const updatedInvoice = {
                ...invoice,
                product,
                quantity,
                totalFees,
                user,
                storage,
            };

            result.push(updatedInvoice);
        }


        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('totalFees')), 'totalSum'],
            ],
            where: { type: "expense" },
        };

        if (storage_id) {
            totalOptions.where.storage_id = storage_id;
        }

        const totals = await invoicesModel.findAll(totalOptions);
        
        res.json({
            totalSum:totals[0].totalSum,
            paginationOptions: { totalRecords, current_page },
                invoices: result,
                status: "success",
        });
} catch (err) {
    console.error(err);
    res.json({ message: "فشل في جلب البيانات", status: "failed" });
}
});
      
//today expense invoices
sell.get("/todayExpensesInvoices", async (req, res) => {
    
try {
        var start = moment(new Date()).set({ "hour": 07, "minute": 00 })
        var end = moment(new Date())
        var duration = moment.duration(end.diff(start));
        var hours = duration.asHours();

        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;
        let totalRecords = 0;

        const options = {
            raw: true,
            limit,
            offset,
            where: { 
                type: "expense" ,
                creationDate: { [op.gte]: moment().subtract(hours, 'hours').format('YYYY-MM-DD HH:mm:ss')} 
            },
            order: [['creationDate', 'DESC']],
        };

        let storage_id = req.query.storageId;

        if (storage_id) {
            const storageProducts = await productStoragesModel.findAll({ raw: true, where: { storage_id } });
            if (storageProducts.length > 0) {
                const productIds = storageProducts.map(product => product.product_id);
                options.where.supplyProduct_id = { [op.in]: productIds };
            } else {
                res.json({ message: "هذا المنتج غير متاح في هذا المخزن", status: "failed" });
                return;
            }
        }

        const invoices = await invoicesModel.findAndCountAll(options);
        totalRecords = invoices.count;

        if (invoices.rows.length === 0) {
            res.json({ message: "لا يوجد فواتير شراء", status: "failed" });
            return;
        }

        const result = [];

        for (let i = 0; i < invoices.rows.length; i++) {
            const invoice = invoices.rows[i];

            let product = null;
            if (invoice.supplyProduct_id) {
                product = await supplyProductModel.findOne({ raw: true, where: { productId: invoice.supplyProduct_id } });
            }

            let storageProduct = null;
            let quantity = invoice.quantity;
            let totalFees = invoice.totalFees;
            if (storage_id && product) {
                storageProduct = await productStoragesModel.findOne({ raw: true, where: { storage_id, product_id: product.productId } });
                if (storageProduct) {
                  //  quantity = storageProduct.quantity;
                    totalFees = product.piecePurchasePrice * quantity;
                }
            }
                                                                            
            let user = null;
            let session = null;
            if (invoice.session_id) {
                session = await sessionModel.findOne({ raw: true, where: { sessionId: invoice.session_id, storage_id:invoice.storage_id } });
                if (session) {
                    user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                }
            }

            let storage = null;
            if (storage_id) {
                storage = await storagesModel.findOne({ raw: true, where: { storageId: storage_id } });
            }

            const updatedInvoice = {
                ...invoice,
                product,
                quantity,
                totalFees,
                user,
                storage,
            };

            result.push(updatedInvoice);
        }

        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('totalFees')), 'totalSum'],
            ],
            where: { 
                type: "expense" ,
                creationDate: { [op.gte]: moment().subtract(hours, 'hours').format('YYYY-MM-DD HH:mm:ss')} 
            },
        };

        if (storage_id) {
            totalOptions.where.storage_id = storage_id;
        }

        const totals = await invoicesModel.findAll(totalOptions);
        
        res.json({
            totalSum:totals[0].totalSum,
            paginationOptions: { totalRecords, current_page },
            invoices: result,
            status: "success",
        });
} catch (err) {
    console.error(err);
    res.json({ message: "فشل في جلب البيانات", status: "failed" });
}
   

})  
//last 7 days Expense invoices
sell.get("/last7DaysExpenseInvoices", async (req, res) => {
    try {

        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;
        let totalRecords = 0;

        const options = {
            raw: true,
            limit,
            offset,
            where: { 
                type: "expense" ,
                creationDate: { [op.gte]: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss') }
            },
            order: [['creationDate', 'DESC']],
        };

        let storage_id = req.query.storageId;

        if (storage_id) {
            const storageProducts = await productStoragesModel.findAll({ raw: true, where: { storage_id } });
            if (storageProducts.length > 0) {
                const productIds = storageProducts.map(product => product.product_id);
                options.where.supplyProduct_id = { [op.in]: productIds };
            } else {
                res.json({ message: "هذا المنتج غير متاح في هذا المخزن", status: "failed" });
                return;
            }
        }

        const invoices = await invoicesModel.findAndCountAll(options);
        totalRecords = invoices.count;

        if (invoices.rows.length === 0) {
            res.json({ message: "لا يوجد فواتير شراء", status: "failed" });
            return;
        }

        const result = [];

        for (let i = 0; i < invoices.rows.length; i++) {
            const invoice = invoices.rows[i];

            let product = null;
            if (invoice.supplyProduct_id) {
                product = await supplyProductModel.findOne({ raw: true, where: { productId: invoice.supplyProduct_id } });
            }

            let storageProduct = null;
            let quantity = invoice.quantity;
            let totalFees = invoice.totalFees;
            if (storage_id && product) {
                storageProduct = await productStoragesModel.findOne({ raw: true, where: { storage_id, product_id: product.productId } });
                if (storageProduct) {
                   // quantity = storageProduct.quantity;
                    totalFees = product.piecePurchasePrice * quantity;
                }
            }

            let user = null;
            let session = null;
            if (invoice.session_id) {
                session = await sessionModel.findOne({ raw: true, where: { sessionId: invoice.session_id, storage_id:invoice.storage_id } });
                if (session) {
                    user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                }
            }

            let storage = null;
            if (storage_id) {
                storage = await storagesModel.findOne({ raw: true, where: { storageId: storage_id } });
            }

            const updatedInvoice = {
                ...invoice,
                product,
                quantity,
                totalFees,
                user,
                storage,
            };

            result.push(updatedInvoice);
        }

        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('totalFees')), 'totalSum'],
            ],
            where: { 
                type: "expense" ,
                creationDate: { [op.gte]: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss') }
            },
        };

        if (storage_id) {
            totalOptions.where.storage_id = storage_id;
        }

        const totals = await invoicesModel.findAll(totalOptions);
        
        res.json({
            totalSum:totals[0].totalSum,
            paginationOptions: { totalRecords, current_page },
                invoices: result,
                status: "success",
        });
} catch (err) {
    console.error(err);
    res.json({ message: "فشل في جلب البيانات", status: "failed" });
}
    

})
//last 30 days Expense invoices
sell.get("/last30DaysExpenseInvoices", async (req, res) => {
    try {

        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;
        let totalRecords = 0;

        const options = {
            raw: true,
            limit,
            offset,
            where: { 
                type: "expense" ,
                creationDate: { [op.gte]: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss') }
            },
            order: [['creationDate', 'DESC']],
        };

        let storage_id = req.query.storageId;

        if (storage_id) {
            const storageProducts = await productStoragesModel.findAll({ raw: true, where: { storage_id } });
            if (storageProducts.length > 0) {
                const productIds = storageProducts.map(product => product.product_id);
                options.where.supplyProduct_id = { [op.in]: productIds };
            } else {
                res.json({ message: "هذا المنتج غير متاح في هذا المخزن", status: "failed" });
                return;
            }
        }

        const invoices = await invoicesModel.findAndCountAll(options);
        totalRecords = invoices.count;

        if (invoices.rows.length === 0) {
            res.json({ message: "لا يوجد فواتير شراء", status: "failed" });
            return;
        }

        const result = [];

        for (let i = 0; i < invoices.rows.length; i++) {
            const invoice = invoices.rows[i];

            let product = null;
            if (invoice.supplyProduct_id) {
                product = await supplyProductModel.findOne({ raw: true, where: { productId: invoice.supplyProduct_id } });
            }

            let storageProduct = null;
            let quantity = invoice.quantity;
            let totalFees = invoice.totalFees;
            if (storage_id && product) {
                storageProduct = await productStoragesModel.findOne({ raw: true, where: { storage_id, product_id: product.productId } });
                if (storageProduct) {
                   // quantity = storageProduct.quantity;
                    totalFees = product.piecePurchasePrice * quantity;
                }
            }

            let user = null;
            let session = null;
            if (invoice.session_id) {
                session = await sessionModel.findOne({ raw: true, where: { sessionId: invoice.session_id, storage_id:invoice.storage_id } });
                if (session) {
                    user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                }
            }

            let storage = null;
            if (storage_id) {
                storage = await storagesModel.findOne({ raw: true, where: { storageId: storage_id } });
            }

            const updatedInvoice = {
                ...invoice,
                product,
                quantity,
                totalFees,
                user,
                storage,
            };

            result.push(updatedInvoice);
        }

        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('totalFees')), 'totalSum'],
            ],
            where: { 
                type: "expense" ,
                creationDate: { [op.gte]: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss') }
            },
        };

        if (storage_id) {
            totalOptions.where.storage_id = storage_id;
        }

        const totals = await invoicesModel.findAll(totalOptions);
        
        res.json({
            totalSum:totals[0].totalSum,
            paginationOptions: { totalRecords, current_page },
                invoices: result,
                status: "success",
        });
} catch (err) {
    console.error(err);
    res.json({ message: "فشل في جلب البيانات", status: "failed" });
}
    
})

// all return items
sell.get('/allreturneditems', async (req, res) => {
    try {
        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;

        let storage_id = req.query.storageId;
        let whereClause = { isReturned: "1" };
        let orderClause = [['returnDate', 'DESC']];

        if (storage_id) {
            whereClause.storage_id = storage_id;
        }

        const options = {
            raw: true,
            limit,
            offset,
            where: whereClause,
            order: orderClause,
        };

        const { count, rows: orderItems } = await orderItemModel.findAndCountAll(options);

        if (orderItems.length === 0) {
            res.json({ message: "لا يوجد مرتجع من اى فاتورة", status: "failed" });
            return;
        }

        const result = [];

        for (let i = 0; i < orderItems.length; i++) {
            const orderItem = orderItems[i];
            const session = await sessionModel.findOne({ raw: true, where: { sessionId: orderItem.session_id, storage_id:orderItem.storage_id } });

            if (session) {
                const user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                const invoice = await invoicesModel.findOne({ raw: true, where: { session_id: session.sessionId, storage_id:orderItem.storage_id } });
                const product = await supplyProductModel.findOne({ raw: true, where: { productId: orderItem.product_id } });

                if (invoice) {
                    orderItem.invoice = invoice;
                    orderItem.user = user;
                    orderItem.product = JSON.parse(orderItem.product);
                    const storage = await storagesModel.findOne({ raw: true, where: { storageId: orderItem.storage_id } });
                    orderItem.storage = storage;
                }
            }

            result.push(orderItem);
        }

        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('fee')), 'totalSum'],
            ],
            where: { isReturned: "1" },
        };

        if (storage_id) {
            totalOptions.where.storage_id = storage_id;
        }

        const totals = await orderItemModel.findAll(totalOptions);
        
        res.json({
            totalSum:totals[0].totalSum,
            paginationOptions: { totalRecords: count, current_page },
            orderItems: result,
            status: "success",
        });
    } catch (err) {
        console.error(err);
        res.json({ message: "فشل في جلب البيانات", status: "failed" });
    }
});


// today return items
sell.get('/todayreturneditems',async(req,res)=>{
    try {
        var start = moment(new Date()).set({ "hour": 07, "minute": 00 })
        var end = moment(new Date())
        var duration = moment.duration(end.diff(start));
        var hours = duration.asHours();

        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;

        let storage_id = req.query.storageId;
        let whereClause = { 
            isReturned: "1",
            returnDate: { [op.gte]: moment().subtract(hours, 'hours').format('YYYY-MM-DD HH:mm:ss') 
        } };
        let orderClause = [['returnDate', 'DESC']];

        if (storage_id) {
            whereClause.storage_id = storage_id;
        }

        const options = {
            raw: true,
            limit,
            offset,
            where: whereClause,
            order: orderClause,
        };

        const { count, rows: orderItems } = await orderItemModel.findAndCountAll(options);

        if (orderItems.length === 0) {
            res.json({ message: "لا يوجد مرتجع من اى فاتورة", status: "failed" });
            return;
        }

        const result = [];

        for (let i = 0; i < orderItems.length; i++) {
            const orderItem = orderItems[i];
            const session = await sessionModel.findOne({ raw: true, where: { sessionId: orderItem.session_id, storage_id:orderItem.storage_id } });

            if (session) {
                const user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                const invoice = await invoicesModel.findOne({ raw: true, where: { session_id: session.sessionId, storage_id:orderItem.storage_id } });
                const product = await supplyProductModel.findOne({ raw: true, where: { productId: orderItem.product_id } });

                if (invoice) {
                    orderItem.invoice = invoice;
                    orderItem.user = user;
                    orderItem.product = JSON.parse(orderItem.product);
                    const storage = await storagesModel.findOne({ raw: true, where: { storageId: orderItem.storage_id } });
                    orderItem.storage = storage;
                }
            }

            result.push(orderItem);
        }

        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('fee')), 'totalSum'],
            ],
            where: { 
                isReturned: "1",
                returnDate: { [op.gte]: moment().subtract(hours, 'hours').format('YYYY-MM-DD HH:mm:ss') }
            },
        };

        if (storage_id) {
            totalOptions.where.storage_id = storage_id;
        }

        const totals = await orderItemModel.findAll(totalOptions);
        
        res.json({
            totalSum:totals[0].totalSum,
            paginationOptions: { totalRecords: count, current_page },
            orderItems: result,
            status: "success",
        });
    } catch (err) {
        console.error(err);
        res.json({ message: "فشل في جلب البيانات", status: "failed" });
    }
    
    
   
})
// last 7 days return items
sell.get('/last7DaysReturneditems',async(req,res)=>{
    try {

        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;

        let storage_id = req.query.storageId;
        let whereClause = { 
            isReturned: "1",
            returnDate: { [op.gte]: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss') }
         };
        let orderClause = [['returnDate', 'DESC']];

        if (storage_id) {
            whereClause.storage_id = storage_id;
        }

        const options = {
            raw: true,
            limit,
            offset,
            where: whereClause,
            order: orderClause,
        };

        const { count, rows: orderItems } = await orderItemModel.findAndCountAll(options);

        if (orderItems.length === 0) {
            res.json({ message: "لا يوجد مرتجع من اى فاتورة", status: "failed" });
            return;
        }

        const result = [];

        for (let i = 0; i < orderItems.length; i++) {
            const orderItem = orderItems[i];
            const session = await sessionModel.findOne({ raw: true, where: { sessionId: orderItem.session_id, storage_id:orderItem.storage_id } });

            if (session) {
                const user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                const invoice = await invoicesModel.findOne({ raw: true, where: { session_id: session.sessionId, storage_id:orderItem.storage_id } });
                const product = await supplyProductModel.findOne({ raw: true, where: { productId: orderItem.product_id } });

                if (invoice) {
                    orderItem.invoice = invoice;
                    orderItem.user = user;
                    orderItem.product = JSON.parse(orderItem.product);
                    const storage = await storagesModel.findOne({ raw: true, where: { storageId: orderItem.storage_id } });
                    orderItem.storage = storage;
                }
            }

            result.push(orderItem);
        }


        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('fee')), 'totalSum'],
            ],
            where: { 
                isReturned: "1",
                returnDate: { [op.gte]: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss') }
            },
        };

        if (storage_id) {
            totalOptions.where.storage_id = storage_id;
        }

        const totals = await orderItemModel.findAll(totalOptions);
        
        res.json({
            totalSum:totals[0].totalSum,
            paginationOptions: { totalRecords: count, current_page },
            orderItems: result,
            status: "success",
        });
    } catch (err) {
        console.error(err);
        res.json({ message: "فشل في جلب البيانات", status: "failed" });
    }
    
})
// last 30 days return items
sell.get('/last30DaysReturneditems',async(req,res)=>{
    try {

        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;

        let storage_id = req.query.storageId;
        let whereClause = { 
            isReturned: "1",
            returnDate: { [op.gte]: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss') }
         };
        let orderClause = [['returnDate', 'DESC']];

        if (storage_id) {
            whereClause.storage_id = storage_id;
        }

        const options = {
            raw: true,
            limit,
            offset,
            where: whereClause,
            order: orderClause,
        };

        const { count, rows: orderItems } = await orderItemModel.findAndCountAll(options);

        if (orderItems.length === 0) {
            res.json({ message: "لا يوجد مرتجع من اى فاتورة", status: "failed" });
            return;
        }

        const result = [];

        for (let i = 0; i < orderItems.length; i++) {
            const orderItem = orderItems[i];
            const session = await sessionModel.findOne({ raw: true, where: { sessionId: orderItem.session_id, storage_id:orderItem.storage_id } });

            if (session) {
                const user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                const invoice = await invoicesModel.findOne({ raw: true, where: { session_id: session.sessionId, storage_id:orderItem.storage_id } });
                const product = await supplyProductModel.findOne({ raw: true, where: { productId: orderItem.product_id } });

                if (invoice) {
                    orderItem.invoice = invoice;
                    orderItem.user = user;
                    orderItem.product = JSON.parse(orderItem.product);
                    const storage = await storagesModel.findOne({ raw: true, where: { storageId: orderItem.storage_id } });
                    orderItem.storage = storage;
                }
            }

            result.push(orderItem);
        }

        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('fee')), 'totalSum'],
            ],
            where: { 
                isReturned: "1",
                returnDate: { [op.gte]: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss') }
            },
        };

        if (storage_id) {
            totalOptions.where.storage_id = storage_id;
        }

        const totals = await orderItemModel.findAll(totalOptions);
        
        res.json({
            totalSum:totals[0].totalSum,
            paginationOptions: { totalRecords: count, current_page },
            orderItems: result,
            status: "success",
        });
    } catch (err) {
        console.error(err);
        res.json({ message: "فشل في جلب البيانات", status: "failed" });
    }
    
})
//allCompaniesInvoice
sell.get("/companiesinvoices", async (req, res) => {
    try {
        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;
        let totalRecords = 0;

        const storage_id = req.query.storageId;

        const companies = await compainesModel.findAll({ raw: true, where: {} });

        const companiesWithInvoices = [];

        var totalSum = 0

        for (let i = 0; i < companies.length; i++) {
            const company = companies[i];

            const options = {
                raw: true,
                where: { company_id: company.companyId },
                order: [['creationDate', 'DESC']],
                limit,
                offset
            };

            if (storage_id) {
                options.where.storage_id = storage_id;
            }

            const invoices = await invoicesModel.findAndCountAll(options);
            totalRecords +=  invoices.count;

            const invoicesWithOrderItems = [];
            for (let j = 0; j < invoices.rows.length; j++) {
                const invoice = invoices.rows[j];

                const orderItems = await orderItemModel.findAll({ raw: true, where: { session_id: invoice.session_id, storage_id:invoice.storage_id } });

                invoice.orderItems = orderItems;

                invoice.orderItems.map(item => {
                   return  item.product=JSON.parse(item.product);
                });
                const payments = await paymentModel.findAll({ raw: true, where: { invoice_id: invoice.invoiceId } });

                invoice.payments = payments;

                const session = await sessionModel.findOne({ raw: true, where: { sessionId:invoice.session_id,storage_id:invoice.storage_id } })
               
                const user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });

                invoice.user = user

                
                const storage = await storagesModel.findOne({ raw: true, where: { storageId: invoice.storage_id } });

                invoice.storage = storage


                invoicesWithOrderItems.push(invoice);
            }

            company.invoices = invoicesWithOrderItems;
            if(company.invoices[0]){
                companiesWithInvoices.push(company);
            }

            var totalOptions = {
                raw: true,
                attributes:[
                    [Sequelize.fn('SUM', Sequelize.col('totalFees')), 'totalSum'],
                ],
                where: { company_id: company.companyId },
            };
    
            if (storage_id) {
                totalOptions.where.storage_id = storage_id;
            }
            const totals = await invoicesModel.findAll(totalOptions);
            totalSum += totals[0].totalSum
        }

        
        
        res.json({
            totalSum:totalSum,
            paginationOptions: { totalRecords, current_page },
            companiesInvoices: companiesWithInvoices,
            status: "success",
            message: "يوجد فواتير لشركات",
        });
    } catch (err) {
        console.error(err);
        res.json({ message: "فشل في جلب البيانات", status: "failed" });
    }
});


//today Companies invoices
sell.get("/todayCompaniesinvoices",async(req,res)=>{

    try {

        var start = moment(new Date()).set({ "hour": 07, "minute": 00 })
        var end = moment(new Date())
        var duration = moment.duration(end.diff(start));
        var hours = duration.asHours();

        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;
        let totalRecords = 0;

        const storage_id = req.query.storageId;

        const companies = await compainesModel.findAll({ raw: true, where: {} });

        const companiesWithInvoices = [];

        var totalSum = 0

        for (let i = 0; i < companies.length; i++) {
            const company = companies[i];

            const options = {
                raw: true,
                where: { company_id: company.companyId ,
                    creationDate: { [op.gte]: moment().subtract(hours, 'hours').format('YYYY-MM-DD HH:mm:ss') }
                },
                order: [['creationDate', 'DESC']],
                limit,
                offset
            };

            if (storage_id) {
                options.where.storage_id = storage_id;
            }

            const invoices = await invoicesModel.findAndCountAll(options);
            totalRecords +=  invoices.count;

            const invoicesWithOrderItems = [];
            for (let j = 0; j < invoices.rows.length; j++) {
                const invoice = invoices.rows[j];

                const orderItems = await orderItemModel.findAll({ raw: true, where: { session_id: invoice.session_id, storage_id:invoice.storage_id } });

                invoice.orderItems = orderItems;

                invoice.orderItems.map(item => {
                    return  item.product=JSON.parse(item.product);
                 });

                const payments = await paymentModel.findAll({ raw: true, where: { invoice_id: invoice.invoiceId } });

                invoice.payments = payments;

                const session = await sessionModel.findOne({ raw: true, where: { sessionId:invoice.session_id,storage_id:invoice.storage_id } })
               
                const user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });

                invoice.user = user

                
                const storage = await storagesModel.findOne({ raw: true, where: { storageId: invoice.storage_id } });

                invoice.storage = storage


                invoicesWithOrderItems.push(invoice);
            }

            company.invoices = invoicesWithOrderItems;
            if(company.invoices[0]){
                companiesWithInvoices.push(company);
            }

            var totalOptions = {
                raw: true,
                attributes:[
                    [Sequelize.fn('SUM', Sequelize.col('totalFees')), 'totalSum'],
                ],
                where: { company_id: company.companyId ,
                    creationDate: { [op.gte]: moment().subtract(hours, 'hours').format('YYYY-MM-DD HH:mm:ss') }
                },
            };
    
            if (storage_id) {
                totalOptions.where.storage_id = storage_id;
            }
            const totals = await invoicesModel.findAll(totalOptions);
            totalSum += totals[0].totalSum
        }

        
        
        res.json({
            totalSum:totalSum,
            paginationOptions: { totalRecords, current_page },
            companiesInvoices: companiesWithInvoices,
            status: "success",
            message: "يوجد فواتير لشركات",
        });
    } catch (err) {
        console.error(err);
        res.json({ message: "فشل في جلب البيانات", status: "failed" });
    }
   
    
})
//last 7 Days Companies invoices
sell.get("/last7DaysCompaniesinvoices",async(req,res)=>{
    try {
        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;
        let totalRecords = 0;

        const storage_id = req.query.storageId;

        const companies = await compainesModel.findAll({ raw: true, where: {} });

        const companiesWithInvoices = [];

        var totalSum = 0

        for (let i = 0; i < companies.length; i++) {
            const company = companies[i];

            const options = {
                raw: true,
                where: { company_id: company.companyId ,
                    creationDate:  { [op.gte]: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss') }
                },
                order: [['creationDate', 'DESC']],
                limit,
                offset
            };

            if (storage_id) {
                options.where.storage_id = storage_id;
            }

            const invoices = await invoicesModel.findAndCountAll(options);
            totalRecords +=  invoices.count;

            const invoicesWithOrderItems = [];
            for (let j = 0; j < invoices.rows.length; j++) {
                const invoice = invoices.rows[j];

                const orderItems = await orderItemModel.findAll({ raw: true, where: { session_id: invoice.session_id, storage_id:invoice.storage_id } });

                invoice.orderItems = orderItems;

                invoice.orderItems.map(item => {
                    return  item.product=JSON.parse(item.product);
                 });

                const payments = await paymentModel.findAll({ raw: true, where: { invoice_id: invoice.invoiceId } });

                invoice.payments = payments;

                const session = await sessionModel.findOne({ raw: true, where: { sessionId:invoice.session_id,storage_id:invoice.storage_id } })
               
                const user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });

                invoice.user = user

                
                const storage = await storagesModel.findOne({ raw: true, where: { storageId: invoice.storage_id } });

                invoice.storage = storage


                invoicesWithOrderItems.push(invoice);
            }

            company.invoices = invoicesWithOrderItems;
            if(company.invoices[0]){
                companiesWithInvoices.push(company);
            }

            var totalOptions = {
                raw: true,
                attributes:[
                    [Sequelize.fn('SUM', Sequelize.col('totalFees')), 'totalSum'],
                ],
                where: { company_id: company.companyId ,
                    creationDate:  { [op.gte]: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss') }
                },
            };
    
            if (storage_id) {
                totalOptions.where.storage_id = storage_id;
            }
            const totals = await invoicesModel.findAll(totalOptions);
            totalSum += totals[0].totalSum
        }

        
        
        res.json({
            totalSum:totalSum,
            paginationOptions: { totalRecords, current_page },
            companiesInvoices: companiesWithInvoices,
            status: "success",
            message: "يوجد فواتير لشركات",
        });
    } catch (err) {
        console.error(err);
        res.json({ message: "فشل في جلب البيانات", status: "failed" });
    }
    
})
//last 30 Days Companies invoices
sell.get("/last30DaysCompaniesinvoices",async(req,res)=>{
    try {
        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;
        let totalRecords = 0;

        const storage_id = req.query.storageId;

        const companies = await compainesModel.findAll({ raw: true, where: {} });

        const companiesWithInvoices = [];

        var totalSum = 0

        for (let i = 0; i < companies.length; i++) {
            const company = companies[i];

            const options = {
                raw: true,
                where: { company_id: company.companyId ,
                    creationDate:  { [op.gte]: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss') }
                },
                order: [['creationDate', 'DESC']],
                limit,
                offset
            };

            if (storage_id) {
                options.where.storage_id = storage_id;
            }

            const invoices = await invoicesModel.findAndCountAll(options);
            totalRecords +=  invoices.count;

            const invoicesWithOrderItems = [];
            for (let j = 0; j < invoices.rows.length; j++) {
                const invoice = invoices.rows[j];

                const orderItems = await orderItemModel.findAll({ raw: true, where: { session_id: invoice.session_id, storage_id:invoice.storage_id } });

                invoice.orderItems = orderItems;

                invoice.orderItems.map(item => {
                    return  item.product=JSON.parse(item.product);
                 });

                const payments = await paymentModel.findAll({ raw: true, where: { invoice_id: invoice.invoiceId } });

                invoice.payments = payments;

                const session = await sessionModel.findOne({ raw: true, where: { sessionId:invoice.session_id,storage_id:invoice.storage_id } })
               
                const user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });

                invoice.user = user

                
                const storage = await storagesModel.findOne({ raw: true, where: { storageId: invoice.storage_id } });

                invoice.storage = storage


                invoicesWithOrderItems.push(invoice);
            }

            company.invoices = invoicesWithOrderItems;
            if(company.invoices[0]){
                companiesWithInvoices.push(company);
            }

            var totalOptions = {
                raw: true,
                attributes:[
                    [Sequelize.fn('SUM', Sequelize.col('totalFees')), 'totalSum'],
                ],
                where: { company_id: company.companyId ,
                    creationDate:  { [op.gte]: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss') }
                },
            };
    
            if (storage_id) {
                totalOptions.where.storage_id = storage_id;
            }
            const totals = await invoicesModel.findAll(totalOptions);
            totalSum += totals[0].totalSum
        }

        
        
        res.json({
            totalSum:totalSum,
            paginationOptions: { totalRecords, current_page },
            companiesInvoices: companiesWithInvoices,
            status: "success",
            message: "يوجد فواتير لشركات",
        });
    } catch (err) {
        console.error(err);
        res.json({ message: "فشل في جلب البيانات", status: "failed" });
    }
   
})
sell.post("/addcompany",async(req,res)=>{
    const {companyName,personName,address,phone,type}=req.body;
    let addedAt = moment().format('YYYY-MM-DD HH:mm:ss');
    let company= await compainesModel.create({companyName,personName,address,phone,type,addedAt});
    res.json({message:"تم اضافة الشركة بنجاح" ,status:"success",company});
})
sell.post('/generateinstallmentinvoice/:id', async (req, res) => {
    let sessionId = req.params.id
    const {companyId} = req.body;
    let storage_id = req.query.storageId
    if(storage_id){
        let totalFees = 0;
        let session = await sessionModel.findOne({ raw: true, where: { sessionId, isOrderConfirmed: '0',storage_id } });
        if (session) {
            let company= await compainesModel.findOne({raw:true , where:{companyId}});
            if(company){
                creationDate = moment().format('YYYY-MM-DD HH:mm:ss');
                let orderItems = await orderItemModel.findAll({ raw: true, where: { session_id: session.sessionId,storage_id } });
                if (orderItems[0]) {
                    for (let i = 0; i < orderItems.length; i++) {
                        totalFees += orderItems[i].fee;
                    }
                    let invoice = await invoicesModel.create({ session_id: session.sessionId, totalFees,done:"0", creationDate ,company_id:company.companyId,storage_id });
                    await sessionModel.update({ isOrderConfirmed: '1' }, { where: { sessionId: session.sessionId } });
                    res.json({ message: "تم انشاء الفاتورة بنجاح", status: "success", invoice });
                }
                else {
                    res.json({ message: "لم يتم ادخال طلبات", status: "failed" });
                }
            }
            else{
                res.json({message:"خطأ فى الرقم التعريفي للشركة", status: "falied"})
            }
            }
            else {
                res.json({ message: "خطأ فى الرقم التعريفي للجلسة", status: "falied" })
            }
    }else{
        res.json({ message: "من فضلك اختر مخزن", status: "failed" })
    }
    
      
})
// deposite payment الأجل
sell.post("/payment/:id",async(req,res)=>{
    let invoiceId=req.params.id;
    let { deposite} = req.body;
    let addedAt = moment().format('YYYY-MM-DD HH:mm:ss');
    //console.log("deposte 2bl el fdasf"+ deposite);
    let invoice = await invoicesModel.findOne({raw:true , where:{invoiceId , done:"0" }});
    if(invoice){
        let requiredDeposite = invoice.totalFees-invoice.recievedFees;
        //console.log("required : "+requiredDeposite);
        if(deposite<=requiredDeposite){
          //  console.log("deposite b3d el +"+deposite);
            if(deposite==requiredDeposite){
                let payment = await paymentModel.create({deposite,invoice_id:invoice.invoiceId,addedAt}) ;
                deposite+=invoice.recievedFees;
                await invoicesModel.update({recievedFees:deposite , done:"1"},{where:{invoiceId:invoice.invoiceId}});
                invoice = await invoicesModel.findOne({raw:true , where:{invoiceId}});
                res.json({message:" تم ادخال القيمة بنجاح والفاتورة الأن منتهية" ,status:"success", payment , invoice});
                
            }
            else{
                let payment = await paymentModel.create({deposite,invoice_id:invoice.invoiceId,addedAt}) ;
                deposite+=invoice.recievedFees;
                await invoicesModel.update({recievedFees:deposite },{where:{invoiceId:invoice.invoiceId}});
                invoice = await invoicesModel.findOne({raw:true , where:{invoiceId}});
                res.json({message:"تم ادخال القيمة بنجاح ولم تنتهى الفاتورة",status:"success",payment,invoice})
            }
        }
        else{
            res.json({message:"المبلغ اكثر من المطلوب",status:"failed"});
        }
    }
    else{
        res.json({message:"خطأ فى الرقم التعريفي للفاتورة",status:"failed"})
    }

})
//all undone invoices
sell.get("/undoneinvoices",async(req,res)=>{
    let invoices=await invoicesModel.findAll({raw:true ,where:{done:"0"}});
    if(invoices[0]){
        res.json({message:"يوجد فواتير مفتوحة",invoices});
    }
    else{
        res.json({message:"لا يوجد فاتور مفتوحة"})
    }
})
//all done invoices
sell.get("/alldoneinvoices",async(req,res)=>{
    let invoices=await invoicesModel.findAll({raw:true ,where:{done:"1"}});
    if(invoices[0]){
        res.json({message:"يوجد فواتيري منهية",invoices});
    }
    else{
        res.json({message:"لا يوجد فاتور منتهية"})
    }
})
//companyInvoice
sell.get("/companyInvoices/:id",async(req,res)=>{
    let companyId=req.params.id;
    let company=await compainesModel.findOne({raw:true , where:{companyId,type:"customer"}});
    if(company){        
        let companyInvoices=await invoicesModel.findAll({raw:true ,where:{company_id:company.companyId}});
        if(companyInvoices[0]){
            for (let i = 0; i < companyInvoices.length; i++) {
                companyInvoices[i].company=company;
            }
            res.json({message:"يوجد فواتير",companyInvoices});
        }
        else{
            res.json({message:"لا يوجد فواتير "})
        }
    }
    else{
        res.json({message:"خطأ فى الرقم التعريفي للشركة", status:"failed"})
    }
})

// installments of invoice
sell.get('/invoiceinstallments/:id',async(req,res)=>{
    let invoiceId=req.params.id;
    let invoice= await invoicesModel.findOne({raw:true ,where:{invoiceId}});
    if(invoice){
        if(invoice.company_id){
            let payments = await paymentModel.findAll({raw:true , where:{invoice_id:invoice.invoiceId}});
            if(payments[0]){
                let total =0;
                for (let i = 0; i < payments.length; i++) {
                    total+=payments[i].deposite;
                }
                invoice.payments=payments;
                if(total==invoice.totalFees){
                    res.json({message:"تم تسديد جميع الأقساط" ,invoice ,flag:1})
                }
                else{
                    res.json({message:"تم تسديد عدد من الاقساط",invoice,flage:0});
                }
            }
            else{
                res.json({message:"لم يتم تسديد اى اقساط"})
            }
        }
        else{
            res.json({message:"الفاترو ليست مقسطة",status:"failed"});
        }
    }
    else{
        res.json({message:"خطأ فى الرقم التعريفي للفاتورة",status:"failed"})
    }
})

sell.get("/productinvoices/:id", async (req, res) => {
    let productId = req.params.id
    let product = await supplyProductModel.findOne({ raw: true, where: { productId } });

    if (product) {
        let invoices = await invoicesModel.findAll({ raw: true, where: { type: 'expense', supplyProduct_id: product.productId }, order: [['creationDate', 'DESC']] });
        if (invoices[0]) {
            res.json({ invoices, status: "success" });
        }
        else {
            res.json({ message: "لا يوجد فواتير شراء لهذا المنتج ", status: "failed" })
        }
    }
    else {
        res.json({ message: "خطأ فى الرقم التعريفي للمنتج ", status: "failed" });
    }
})

// return orderItem

sell.post("/returnitem/:id",async(req,res)=>{
    let orderItemId=req.params.id;
        let orderItem = await orderItemModel.findOne({raw:true ,  where:{isReturned:"0",orderItemId}});
        if(orderItem){
            let session=await sessionModel.findOne({raw:true , where:{isOrderConfirmed:"1",sessionId:orderItem.session_id}});
            if(session){
                let invoice = await invoicesModel.findOne({raw:true , where:{session_Id:session.sessionId}});
                if(invoice){
                    let d = new Date();
                    let momentDate = moment(d).format("YYYY-MM-DDTHH:mm");
                    var deadLine = moment(invoice.creationDate).add(14, 'days').format("YYYY-MM-DD HH:mm");
                   
                    // deadLine  = moment(deadLine).format("YYYY-MM-DD HH:MM");
                    
                    let test = moment(momentDate).isBetween(invoice.creationDate,deadLine,'minutes', '[]');
                    // console.log(test);
                    // console.log(moment(invoice.creationDate).format("YYYY-MM-DD HH:mm"));
                    // console.log(momentDate);
                    // console.log(deadLine);
                    if(test){
                        let returning = await returningIvoiceModel.findOne({raw:true ,order:[["returningId" ,"ASC"]], where:{invoice_id:invoice.invoiceId}});
                        
                        if(!returning){
                            let product=await supplyProductModel.findOne({raw:true , where:{productId:orderItem.product_id}});
                            if(product){
                                let productStorage = await productStoragesModel.findOne({raw:true , where:{storage_id:orderItem.storage_id,product_id:product.productId}})
                                
                                if(productStorage){
                                    let returningInvoice = await returningIvoiceModel.create({invoice_id:invoice.invoiceId,addedAt:momentDate,orderItem_id:orderItem.orderItemId}); 
                                    returningInvoice = await returningIvoiceModel.findOne({raw:true , where:{invoice_id:invoice.invoiceId}});
                                    returningInvoice.orderItem = orderItem;
                                    returningInvoice.baseInvoice=invoice;
                                    await supplyProductModel.update({quantity:product.quantity+orderItem.quantity},{where:{productId:orderItem.product_id}});
                                    await productStoragesModel.update({quantity:productStorage.quantity+orderItem.quantity},{where:{storage_id:orderItem.storage_id,product_id:orderItem.product_id}});
                                    await orderItemModel.update({isReturned:"1",returnDate:moment().format('YYYY-MM-DD HH:mm:ss')},{where:{orderItemId:orderItem.orderItemId}});
                                    orderItem = await orderItemModel.findOne({raw:true ,  where:{session_id:orderItem.session_id,orderItemId}});
                                    res.json({message:"تم وضع المطلوب فى المرتجع بنجاح",status:"success" ,returningInvoice });
                                }else{
                                        res.json({message:"المخزن الذي خرج منه هذا المنتج غير موجود",status:"failed"  });
                                }
                            }else{
                                res.json({message:"انت تحاول ارجاع منتج غير موجود او تم مسحه من السيستم",status:"failed"  });
                            }
                            
                           
                            
                        }
                        else{
                            let match = moment(momentDate).diff(returning.addedAt,'hours');
                            if(match<24){
                                
                                let product=await supplyProductModel.findOne({raw:true , where:{productId:orderItem.product_id}});
                                if(product){
                                    let productStorage = await productStoragesModel.findOne({raw:true , where:{storage_id:orderItem.storage_id,product_id:product.productId}})
                                    
                                    if(productStorage){
                                        let returningInvoice = await returningIvoiceModel.create({invoice_id:invoice.invoiceId,addedAt:momentDate,orderItem_id:orderItem.orderItemId}); 
                                        returningInvoice = await returningIvoiceModel.findOne({raw:true , where:{invoice_id:invoice.invoiceId}});
                                        returningInvoice.orderItem = orderItem;
                                        returningInvoice.baseInvoice=invoice;
                                        await supplyProductModel.update({quantity:product.quantity+orderItem.quantity},{where:{productId:orderItem.product_id}});
                                        await productStoragesModel.update({quantity:productStorage.quantity+orderItem.quantity},{where:{storage_id:orderItem.storage_id,product_id:orderItem.product_id}});
                                        await orderItemModel.update({isReturned:"1",returnDate:moment().format('YYYY-MM-DD HH:mm:ss')},{where:{orderItemId:orderItem.orderItemId}});
                                        orderItem = await orderItemModel.findOne({raw:true ,  where:{session_id:orderItem.session_id,orderItemId}});
                                        res.json({message:"تم وضع المطلوب فى المرتجع بنجاح",status:"success" ,returningInvoice });
                                    }else{
                                        res.json({message:"المخزن الذي خرج منه هذا المنتج غير موجود",status:"failed"  });
                                    }
                                }else{
                                    res.json({message:"انت تحاول ارجاع منتج غير موجود او تم مسحه من السيستم",status:"failed"  });
                                }
                               
                            }
                            else{
                                res.json({message:"لا يمكن إرجاع قطعه بعد ارجاع جزء من الفاتورة ب 24 ساعة " , status:"failed"})
                            }
                            
                        }

                    }
                    else{
                        res.json({message:"لا يمكن ارجاع المبيع بعد 14 يوم من الاستلام" ,status:"failed"});
                    }

                   
                }
                else{
                    res.json({message:"لا يوجد فاتورة " ,status:"failed"})
                }

            }
            else{
                res.json({message:"خطأ فى الرقم التعريفى للجلسة",status:"failed"});
            }
        }
        else{
            res.json({message:"خطأ فى رقم المطلوب" , status:"failed"});
        }
})

sell.get("/invoicereturneditems/:id",async(req,res)=>{
    let invoiceId=req.params.id;
    let invoice = await invoicesModel.findOne({raw:true , where:{invoiceId}});
    if(invoice){
        let session=await sessionModel.findOne({raw:true , where:{sessionId:invoice.session_id,isOrderConfirmed:"1"}});
        if(session){
            let orderItems= await orderItemModel.findAll({raw:true , where:{session_id:session.sessionId,isReturned:"1"}});
            if(orderItems[0]){
                invoice.returnedItems=orderItems
                res.json({message:"يوجد مرتجعات لهذه الفاتورة " ,invoice});
            }
            else{
                res.json({message:"لا يوجد مرتجعات من هذه الفاتورة"})
            }
        }
        else{
            res.json({message:"لا يوجد جلسة لهذه الفاتورة" ,status:"failed"})
        }
    }
    else{
        res.json({message:"خطأ فى الرقم التعريفي للفاتورة",status:"failed"});
    }
})
//allCompanies
sell.get('/allcompanies',async(req,res)=>{
    let allcompanies = await compainesModel.findAll({raw:true , where:{type:"customer"}});
    if(allcompanies[0]){
        res.json({allcompanies,status:"success"});
    }   
    else{
        res.json({message:"There is no companies",status:"failed"})
    }
})
//allCompanies
sell.get('/allsuppliers',async(req,res)=>{
    let allsuppliers = await compainesModel.findAll({raw:true , where:{type:"supplier"}});
    if(allsuppliers[0]){
        res.json({allsuppliers,status:"success"});
    }   
    else{
        res.json({message:"There is no suppliers",status:"failed"})
    }
})


//search returned invoices
// sell.get('/searchreturnedinvoices',async(req,res)=>{
//     let searchKey = req.query.searckquery;
//     let storage_id = req.query.storageId
//     if(storage_id){
//         let invoices = await invoicesModel.findAll({ raw: true, where: { 
//             type: "revenue" ,
//             invoiceId:{[op.like]:`%${searchKey}%`},
//             storage_id}, order: [['creationDate', 'DESC']] });
//         if (invoices[0]) {
//             for (let i = 0; i < invoices.length; i++) {
//                 let products = [];
//                 let orderItems = await orderItemModel.findAll({ raw: true, where: { session_id: invoices[i].session_id,storage_id } });
    
//                 let session = await sessionModel.findOne({ raw: true, where: { sessionId: invoices[i].session_id,storage_id } })
//                 let user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                
//                 if (orderItems[0]) {
//                     for (let j = 0; j < orderItems.length; j++) {
//                         orderItems[j].product=JSON.parse(orderItems[j].product);    
//                          /*
//                         {orderdata , , products[price , name , quantity]}
//                         */
//                     }
//                     invoices[i].orderItems = orderItems;
//                     invoices[i].user = user
//                     let storage = await storagesModel.findOne({raw:true,   where:{ storageId:storage_id}})
//                     invoices[i].storage = storage
//                 }
//                 else {
//                     invoices[i].orderItems = []
//                 }
//             }
            
//             res.json({ invoices, status: "success" })
//         }
//         else {
//             res.json({ message: "لا يوجد فواتير مبيعات" })
//         }
//     }else{
//         let invoices = await invoicesModel.findAll({ raw: true, where: { type: "revenue",
//          invoiceId:{[op.like]:`%${searchKey}%`}
//         }, order: [['creationDate', 'DESC']] });
//         if (invoices[0]) {
//             for (let i = 0; i < invoices.length; i++) {
//                 let products = [];
//                 let orderItems = await orderItemModel.findAll({ raw: true, where: { session_id: invoices[i].session_id } });
    
//                 let session = await sessionModel.findOne({ raw: true, where: { sessionId: invoices[i].session_id } })
//                 let user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                
//                 if (orderItems[0]) {
//                     for (let j = 0; j < orderItems.length; j++) {
//                         orderItems[j].product=JSON.parse(orderItems[j].product);    
//                          /*
//                         {orderdata , , products[price , name , quantity]}
//                         */
//                     }
//                     invoices[i].orderItems = orderItems;
//                     invoices[i].user = user
//                     let storage = await storagesModel.findOne({raw:true,   where:{ storageId:invoices[i].storage_id ,isDeleted : '0'}})
//                     invoices[i].storage = storage
//                 }
//                 else {
//                     invoices[i].orderItems = []
//                 }
//             }
//             res.json({ invoices, status: "success" })
//         }
//         else {
//             res.json({ message: "لا يوجد فواتير مبيعات" })
//         }
//     }
    
// })

sell.get("/searchreturnedinvoices", async (req, res) => {
    try {
        let searchKey = req.query.searckquery;
        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;
        let totalRecords = 0;

        const options = {
            raw: true,
            limit,
            offset,
            where: { type: "revenue",
            invoiceId:{[op.startsWith]: searchKey} },
            order: [['creationDate', 'DESC']],
        };

        let storage_id = req.query.storageId;

        if (storage_id) {
            options.where.storage_id = storage_id;
        }

        const invoices = await invoicesModel.findAndCountAll(options);
        totalRecords = invoices.count;

        if (invoices.rows.length === 0) {
            res.json({ message: "لا يوجد فواتير مبيعات", status: "failed" });
            return;
        }

        const data = invoices.rows.map(async (invoice) => {
            let orderItems = null
            let session = null
            let storage = null
            if(storage_id){
                orderItems = await orderItemModel.findAll({
                    raw: true,
                    where: { session_id: invoice.session_id, storage_id },
                });
    
                session = await sessionModel.findOne({
                    raw: true,
                    where: { sessionId: invoice.session_id, storage_id },
                });
    
                storage = await storagesModel.findOne({
                    raw: true,
                    where: { storageId: invoice.storage_id },
                });
            }else{

                orderItems = await orderItemModel.findAll({
                    raw: true,
                    where: { session_id: invoice.session_id, storage_id: invoice.storage_id},
                });
    
                session = await sessionModel.findOne({
                    raw: true,
                    where: { sessionId: invoice.session_id,storage_id: invoice.storage_id },
                });
    
    
                storage = await storagesModel.findOne({
                    raw: true,
                    where: { storageId: invoice.storage_id },
                });
            }

            orderItems = orderItems.map((orderItem) => {
                orderItem.product = JSON.parse(orderItem.product);
                return orderItem;
            });

            const user = await userModel.findOne({
                raw: true,
                where: { userId: session.user_id },
                attributes: { exclude: ['password'] },
            });
            

            invoice.orderItems = orderItems;
            invoice.user = user;
            invoice.storage = storage;

            return invoice;
        });

        const result = await Promise.all(data);
        
        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('totalFees')), 'totalSum'],
            ],
            where: { type: "revenue" },
        };

        if (storage_id) {
            totalOptions.where.storage_id = storage_id;
        }

        const totals = await invoicesModel.findAll(totalOptions);
        res.json({
            totalSum:totals[0].totalSum,
            paginationOptions: { totalRecords, current_page },
            invoices: result,
            status: "success",
        });

    } catch (err) {
        console.log(err);
    }
});
sell.get("/searchcompaniesreturnedinvoices", async (req, res) => {
    try {
        let searchKey = req.query.searckquery;
        const { page, pageSize } = req.query;
        const limit = parseInt(pageSize, 10) || 10; // default to 10 if not specified
        const offset = (parseInt(page, 10) - 1) * limit || 0; // calculate offset based on page number
        const current_page = page ? page : 1;
        let totalRecords = 0;

        const options = {
            raw: true,
            limit,
            offset,
            where: { 
                type: "expense",
                invoiceId:{[op.startsWith]: searchKey} 
            },
            order: [['creationDate', 'DESC']],
        };

        let storage_id = req.query.storageId;

        if (storage_id) {
            const storageProducts = await productStoragesModel.findAll({ raw: true, where: { storage_id } });
            if (storageProducts.length > 0) {
                const productIds = storageProducts.map(product => product.product_id);
                options.where.supplyProduct_id = { [op.in]: productIds };
            } else {
                res.json({ message: "هذا المنتج غير متاح في هذا المخزن", status: "failed" });
                return;
            }
        }

        const invoices = await invoicesModel.findAndCountAll(options);
        totalRecords = invoices.count;

        if (invoices.rows.length === 0) {
            res.json({ message: "لا يوجد فواتير شراء", status: "failed" });
            return;
        }

        const result = [];

        for (let i = 0; i < invoices.rows.length; i++) {
            const invoice = invoices.rows[i];

            let product = null;
            if (invoice.supplyProduct_id) {
                product = await supplyProductModel.findOne({ raw: true, where: { productId: invoice.supplyProduct_id } });
            }

            let storageProduct = null;
            let quantity = invoice.quantity;
            let totalFees = invoice.totalFees;
            if (storage_id && product) {
                storageProduct = await productStoragesModel.findOne({ raw: true, where: { storage_id, product_id: product.productId } });
                if (storageProduct) {
                    // quantity = storageProduct.quantity;
                    totalFees = product.piecePurchasePrice * quantity;
                }
            }

            let user = null;
            let session = null;
            if (invoice.session_id) {
                session = await sessionModel.findOne({ raw: true, where: { sessionId: invoice.session_id, storage_id:invoice.storage_id } });
                if (session) {
                    
                    
                    user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                }
            }

            let storage = null;
            if (storage_id) {
                storage = await storagesModel.findOne({ raw: true, where: { storageId: storage_id } });
            }

            const updatedInvoice = {
                ...invoice,
                product,
                quantity,
                totalFees,
                user,
                storage,
            };

            result.push(updatedInvoice);
        }

        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('totalFees')), 'totalSum'],
            ],
            where: { type: "expense" },
        };

        if (storage_id) {
            totalOptions.where.storage_id = storage_id;
        }

        const totals = await invoicesModel.findAll(totalOptions);
        
        res.json({
            totalSum:totals[0].totalSum,
            paginationOptions: { totalRecords, current_page },
                invoices: result,
                status: "success",
        });
} catch (err) {
    console.error(err);
    res.json({ message: "فشل في جلب البيانات", status: "failed" });
}
});

//search comapnies 
sell.get("/searchcompanies",async(req,res)=>{
    let searchKey = req.query.searckquery;
    let companies=await compainesModel.findAll({raw:true , where:{
        companyName: {[op.like]:`%${searchKey}%`}
    }});
    let companiesInvoices=[];
    let storage_id = req.query.storageId
    if(storage_id){
        if(companies[0]){   
            for (let i = 0; i < companies.length; i++) {
                let companyInvoices=await invoicesModel.findAll({raw:true ,where:{company_id:companies[i].companyId,storage_id}, order: [['creationDate', 'DESC']]});
                if(companyInvoices[0]){
                    companies[i].invoices=companyInvoices;
                    companies[i].invoices.sort((a,b)=>{
                        
                        return  new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
                    })
                    for (let j = 0; j < companyInvoices.length; j++) {
                        let orderItems = await orderItemModel.findAll({raw:true , where:{session_id:companyInvoices[j].session_id,storage_id}});
                        if(orderItems[0]){
                            for (let o = 0; o < orderItems.length; o++) {
                                let product = await supplyProductModel.findOne({raw:true , where:{productId:orderItems[o].product_id}});
                                orderItems[o].product=JSON.parse(orderItems[o].product);                            
                            }
                            companies[i].invoices[j].orderItems=orderItems;
                        }
                        //companies[i].invoice
                        let payments = await paymentModel.findAll({raw:true , where:{invoice_id:companyInvoices[j].invoiceId}});
                        if(payments[0]){
                            let total =0;
                            for (let k = 0; k < payments.length; k++) {
                                total+=payments[k].deposite;
                            }
                            companies[i].invoices[j].payments=payments;
                            
                        }
                        let session = await sessionModel.findOne({ raw: true, where: { sessionId: companyInvoices[j].session_id,storage_id } })
                        let user = {}
                        if (session) {
                            user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                        }
                        if (user) {
                            companies[i].invoices[j].user = user
                        }
                        let storage = await storagesModel.findOne({raw:true,   where:{ storageId:storage_id}})
                        companies[i].invoices[j].storage = storage
                        
                    }
                    companiesInvoices.push(companies[i]);
    
                }     
            }     
            if(companiesInvoices[0]){
                companiesInvoices.sort((a,b)=>{
                    return  new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
                })
                res.json({message:"يوجد فواتير لشركات",companiesInvoices,status:"success"})
            }
            else{
                res.json({message:"لا يوجد فواتير لشركات",status:"failed"})
            }
        }
        else{
            res.json({message:"لا يوجد شركات ", status:"failed"})
        }
    }else{
        if(companies[0]){   
            for (let i = 0; i < companies.length; i++) {
                let companyInvoices=await invoicesModel.findAll({raw:true ,where:{company_id:companies[i].companyId}, order: [['creationDate', 'DESC']]});
                if(companyInvoices[0]){
                    companies[i].invoices=companyInvoices;
                    companies[i].invoices.sort((a,b)=>{
                        
                        return  new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
                    })
                    for (let j = 0; j < companyInvoices.length; j++) {
                        let orderItems = await orderItemModel.findAll({raw:true , where:{session_id:companyInvoices[j].session_id}});
                        if(orderItems[0]){
                            for (let o = 0; o < orderItems.length; o++) {
                                let product = await supplyProductModel.findOne({raw:true , where:{productId:orderItems[o].product_id}});
                                orderItems[o].product=JSON.parse(orderItems[o].product);                            
                            }
                            companies[i].invoices[j].orderItems=orderItems;
                        }
                        //companies[i].invoice
                        let payments = await paymentModel.findAll({raw:true , where:{invoice_id:companyInvoices[j].invoiceId}});
                        if(payments[0]){
                            let total =0;
                            for (let k = 0; k < payments.length; k++) {
                                total+=payments[k].deposite;
                            }
                            companies[i].invoices[j].payments=payments;
                            
                        }
                        let session = await sessionModel.findOne({ raw: true, where: { sessionId: companyInvoices[j].session_id } })
                        let user = {}
                        if (session) {
                            user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                        }
                        if (user) {
                            companies[i].invoices[j].user = user
                        }
                        let storage = await storagesModel.findOne({raw:true,   where:{ storageId:companies[i].invoices[j].storage_id}})
                        companies[i].invoices[j].storage = storage
                    }
                    companiesInvoices.push(companies[i]);
    
                }     
            }     
            if(companiesInvoices[0]){
                companiesInvoices.sort((a,b)=>{
                    return  new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
                })
                res.json({message:"يوجد فواتير لشركات",companiesInvoices,status:"success"})
            }
            else{
                res.json({message:"لا يوجد فواتير لشركات",status:"failed"})
            }
        }
        else{
            res.json({message:"لا يوجد شركات ", status:"failed"})
        }
    }
    
})
//search comapnies invoices
// sell.get("/searchcompaniesinvoices",async(req,res)=>{
//     let searchKey = req.query.searckquery;
//     let companies=await compainesModel.findAll({raw:true , where:{
        
//     }});
//     let companiesInvoices=[];
//     let storage_id = req.query.storageId;
//     let invoices = null
//     if(storage_id){
//         if(companies[0]){   
//             for (let i = 0; i < companies.length; i++) {
//                 let companyInvoices=await invoicesModel.findAll({raw:true ,where:{
//                     invoiceId:{[op.like]:`%${searchKey}%`},
//                     company_id:companies[i].companyId,storage_id}, order: [['creationDate', 'DESC']]});
//                 if(companyInvoices[0]){
//                     invoices=companyInvoices;
//                     for (let j = 0; j < invoices.length; j++) {
//                         let orderItems = await orderItemModel.findAll({raw:true , where:{session_id:invoices[j].session_id,storage_id}});
//                         if(orderItems[0]){
//                             for (let o = 0; o < orderItems.length; o++) {
//                                 let product = await supplyProductModel.findOne({raw:true , where:{productId:orderItems[o].product_id}});
//                                 orderItems[o].product=JSON.parse(orderItems[o].product);                            
//                             }
//                             invoices[j].orderItems=orderItems;
//                         }
//                         //companies[i].invoice
//                         let payments = await paymentModel.findAll({raw:true , where:{invoice_id:invoices[j].invoiceId}});
//                         if(payments[0]){
//                             let total =0;
//                             for (let k = 0; k < payments.length; k++) {
//                                 total+=payments[k].deposite;
//                             }
//                             invoices[j].payments=payments;
                            
//                         }
//                         let session = await sessionModel.findOne({ raw: true, where: { sessionId: invoices[j].session_id,storage_id } })
//                         let user = {}
//                         if (session) {
//                             user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
//                         }
//                         if (user) {
//                             invoices[j].user = user
//                         }
//                         let storage = await storagesModel.findOne({raw:true,   where:{ storageId:storage_id}})
//                         invoices[j].storage = storage
                        
//                     }
    
//                 }     
//             }     
//             if(invoices[0]){
//                 res.json({message:"يوجد فواتير لشركات",invoices,status:"success"})
//             }
//             else{
//                 res.json({message:"لا يوجد فواتير لشركات",status:"failed"})
//             }
//         }
//         else{
//             res.json({message:"لا يوجد شركات ", status:"failed"})
//         }
//     }else{
//         if(companies[0]){   
//             for (let i = 0; i < companies.length; i++) {
//                 let companyInvoices=await invoicesModel.findAll({raw:true ,where:{
//                     invoiceId:{[op.like]:`%${searchKey}%`},
//                     company_id:companies[i].companyId}, order: [['creationDate', 'DESC']]});
//                 if(companyInvoices[0]){
//                     invoices=companyInvoices;
//                     for (let j = 0; j < invoices.length; j++) {
//                         let orderItems = await orderItemModel.findAll({raw:true , where:{session_id:invoices[j].session_id}});
//                         if(orderItems[0]){
//                             for (let o = 0; o < orderItems.length; o++) {
//                                 let product = await supplyProductModel.findOne({raw:true , where:{productId:orderItems[o].product_id}});
//                                 orderItems[o].product=JSON.parse(orderItems[o].product);                            
//                             }
//                             invoices[j].orderItems=orderItems;
//                         }
//                         //companies[i].invoice
//                         let payments = await paymentModel.findAll({raw:true , where:{invoice_id:invoices[j].invoiceId}});
//                         if(payments[0]){
//                             let total =0;
//                             for (let k = 0; k < payments.length; k++) {
//                                 total+=payments[k].deposite;
//                             }
//                             invoices[j].payments=payments;
                            
//                         }
//                         let session = await sessionModel.findOne({ raw: true, where: { sessionId: invoices[j].session_id } })
//                         let user = {}
//                         if (session) {
//                             user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
//                         }
//                         if (user) {
//                             invoices[j].user = user
//                         }
//                         let storage = await storagesModel.findOne({raw:true,   where:{ storageId:invoices[j].storage_id}})
//                         invoices[j].storage = storage
//                     }
    
//                 }     
//             }     
//             if(invoices[0]){
//                 res.json({message:"يوجد فواتير لشركات",invoices,status:"success"})
//             }
//             else{
//                 res.json({message:"لا يوجد فواتير لشركات",status:"failed"})
//             }
//         }
//         else{
//             res.json({message:"لا يوجد شركات ", status:"failed"})
//         }
//     }
    
// })
/*sell.patch("/returnitem/:id",async(req,res)=>{
    let orderItemId=req.params.id;
    const {sessionId} = req.body;
    let invoice;
    let product;
    let session=await sessionModel.findOne({raw:true,where:{sessionId,isOrderConfirmed:'1'}});
    if(session){
        let orderItem=await orderItemModel.findOne({raw : true , where:{orderItemId}});
        if(orderItem){
            invoice = await invoicesModel.findOne({raw:true , where:{session_id:sessionId}});
            if(invoice){
                console.log("invoice.totalFees"+invoice.totalFees);
                console.log("order.fees"+orderItem.fee);
                console.log("diff"+(invoice.totalFees-orderItem.fee));
                await invoicesModel.update({totalFees:invoice.totalFees-orderItem.fee},{where:{invoiceId:invoice.invoiceId}});
                product = await supplyProductModel.findOne({raw:true , where:{productId:orderItem.product_id}});
                if(product){
                    await supplyProductModel.update({quantity:product.quantity+orderItem.quantity}, { where: { productId:orderItem.product_id } });
                    await orderItemModel.destroy({ where: { orderItemId } });
                    res.json({message:"تم إرجاع المنتج بنجاح",status:"success"});
                }
                else{
                    res.json({message:"خطا فى رقم المنتج"})
                }
            }
            else{
                res.json({message:"لايوجد فاتورة"})
            }
        }
        else{
            res.json({message:"خطأ فى رقم الطلب",status:"failed"})
        }
    }
    else{
        res.json({message:"خطأ فى رقم الجلسة", status:"failed"})
    }
})*/
module.exports = sell