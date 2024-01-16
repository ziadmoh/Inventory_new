const productStorages = require('express').Router();
const jwt = require('jsonwebtoken')
const productstorageModel = require('../models/productStorages.model');
const Sequelize = require('sequelize');
const e = require('express');
const supplyProduct = require('../models/supplyProduct.model');
const sessionModel = require('../models/sessions.model');
const invoicesModel = require('../models/invoices.model');
const userModel = require('../models/user.model');
const storageModel = require('../models/storages.model');
const moment = require('moment');

const op = Sequelize.Op

productStorages.get("/allproductStorages", async (req, res) => {
    try {
        let storages = await productstorageModel.findAll({ raw: true });
        if (storages[0]) {
            res.json({ storages, status: "success" });
        }
        else {
            res.json({ message: "لا توجد مخازن بعد", status: "failed" })
        }
    } catch (err) {
        console.log(err)
    }
})

productStorages.get("/showproductstorages/:productId", async (req, res) => {
    let productId=req.params.productId;
    try {
        let productstorage = await productstorageModel.findAll({ raw: true, where:{product_id:productId} });
        
        if (productstorage[0]) {
            for(let i=0;i<productstorage.length;i++){
                let storage = await storageModel.findOne({raw:true, where:{storageId:productstorage[i].storage_id}})
                if(storage){
                    productstorage[i].storage = storage
                }
            }
            let product =await supplyProduct.findOne({raw:true, where:{productId,isDeleted:'0'}})
            res.json({ productstorage, status: "success",total_quantity:product.quantity });
        }
        else {
            res.json({ message: "هذا المنتج غير موجود في اي مخزن", status: "failed" })
        }
    } catch (err) {
        console.log(err)
    }
})

productStorages.put("/updateproductstorages/:productId", async (req, res) => {
    let productId=req.params.productId;
    let {token, productStoragesArr} = req.body;
    try {
        if(productStoragesArr[0]){
            let product =await supplyProduct.findOne({raw:true, where:{productId,isDeleted:'0'}})
            if(product){
                let total_quantity = 0
                for(let i = 0 ;i<productStoragesArr.length;i++ ){
                    total_quantity = total_quantity+ productStoragesArr[i].quantity
                }
                if(product.quantity == total_quantity){
                    for(let i = 0 ;i<productStoragesArr.length;i++ ){
                        if(!(productStoragesArr[i].id == -1 && productStoragesArr[i].quantity ==0)){
                            let productstorage = await productstorageModel.findOne({ raw: true, where:{product_id:productId,storage_id:productStoragesArr[i].storage_id} });
                            if(productstorage){
                                if(productStoragesArr[i].quantity == 0){
                                    let ps = await productstorageModel.findOne({ where: { id:productStoragesArr[i].id } })
                                    if(ps){
                                        await productstorageModel.destroy({ where: { id:productstorage.id } })
    
                                    }
                                }else{
                                    await productstorageModel.update({ quantity: productStoragesArr[i].quantity },
                                        { where: { id:productstorage.id } });
                                }
                            }else{
                                await productstorageModel.create({ storage_id:productStoragesArr[i].storage_id,quantity: productStoragesArr[i].quantity, product_id:productId });
                            }
                        }
                        
                    }
                    res.json({ message:"تم نقل الكميات بنجاح", status: "success" });
                }else{
                    res.json({ message: "خطأ في التوزيع من فضلك اعد الحساب", status: "failed" })
                }

            }else{
                res.json({ message: "هذا المنتج غير موجود", status: "failed" })
            }
            


        }else{
            res.json({ message: " من فضلك حدد المخازن", status: "failed" })
        }
       
    } catch (err) {
        console.log(err)
    }
})

productStorages.post('/addProductStorages', async (req, res) => {
    const { token, storageProducts, product_id, userId } = req.body;
    jwt.verify(token, 'admin', async (err, decodded) => {
        if (err) {
            res.json({ message: "خطأ في رمز التأكيد", status: "failed" })
        }
        else {
            if (storageProducts[0]) {
                for (let i = 0; i < storageProducts.length; i++) {
                    let storage = await storageModel.findOne({ raw: true, where: { storageId: storageProducts[i].storageId } });
                    let product = await supplyProduct.findOne({ raw: true, where: { productId: product_id } });
                    
                    let productStorage = await productstorageModel.findOne({
                        raw: true,
                        where: { storage_id:storageProducts[i].storageId, product_id }
                    });
                    
                    if (productStorage) {
                        await productstorageModel.update({ quantity: productStorage.quantity + storageProducts[i].quantity },
                            { where: { storage_id:storageProducts[i].storageId, product_id } });
                    } else {
                        await productstorageModel.create({ storage_id:storageProducts[i].storageId,quantity: storageProducts[i].quantity, product_id });

                    }


                    let user = await userModel.findOne({ raw: true, where: { userId } });

                    let creationDate = moment().format('YYYY-MM-DD HH:mm:ss');

                    await sessionModel.create({ user_id: user.userId, creationDate, isOrderConfirmed: '1' });

                    let session = await sessionModel.findOne({ raw: true, where: { user_id: user.userId, creationDate } });

                    let totalFees = storageProducts[i].quantity * (product.piecePurchasePrice);

                    let invoice = await invoicesModel.create({
                        session_id: session.sessionId, creationDate,
                        type: "expense", supplyProduct_id: product_id,
                        quantity: storageProducts[i].quantity, totalFees, product: product, storage_id:storageProducts[i].storageId
                    })

                    product = await supplyProduct.findOne({ raw: true, where: { productId: product_id } });
                    
                    await supplyProduct.update({ quantity: product.quantity + storageProducts[i].quantity }, { where: { productId: product_id } });
                            
                }
                res.json({ message: "تم اضافة الكمية بنجاح", status: "success" });
            } else {
                res.json({ message: "من فضلك اختر الكمية والمخزن", status: "failed" })
            }

        }
    })
})


module.exports = productStorages