const rets = require('express').Router();
const moment = require('moment');
const e = require('express');
const supplyProductModel = require('../models/supplyProduct.model');
const invoicesModel = require("../models/invoices.model");
const expenseReturnsModel = require("../models/expenseReturns");
const productStoragesModel = require('../models/productStorages.model');
const sessionModel = require('../models/sessions.model');
const userModel = require('../models/user.model');
const Sequelize = require('sequelize');
const storagesModel = require('../models/storages.model');
const op = Sequelize.Op
// return expense Items
rets.put('/returnExpenseItems',async (req, res)=>{
    try{
        const {productId , storages, invoiceId}=req.body;

        let invoice = await invoicesModel.findOne({ raw: true, where: { invoiceId } });
        if(invoice){

        let product = await supplyProductModel.findOne({ raw: true, where: { productId } });
        if(product){
            let d = new Date();
            let momentDate = moment(d).format("YYYY-MM-DDTHH:mm");

            let totalNewQuantity = 0
            storages.forEach(async storage => {
                totalNewQuantity += storage.newQuantity

                let productstorage = await productStoragesModel.findOne({ raw: true, where:{product_id:productId,storage_id:storage.id} });

                if(productstorage){
                    await productStoragesModel.update(
                        { quantity: productstorage.quantity - storage.newQuantity }, { where:{product_id:productId,storage_id:storage.id} }
                    );
                }
            });
            let mappedStorages = storages.filter(storage =>{
                return storage.newQuantity != null
            })

            await expenseReturnsModel.create({
                invoice_id:invoiceId,
                addedAt:momentDate,
                originalInvoiceQuantity:invoice.quantity,
                returnedQuantity:totalNewQuantity,
                originalTotalFees:invoice.totalFees,
                returnedTotalFees:totalNewQuantity * product.piecePurchasePrice,
                storages:mappedStorages
            }); 

            invoice.quantity = invoice.quantity - totalNewQuantity
            invoice.totalFees = invoice.quantity * product.piecePurchasePrice
            
            await invoicesModel.update({
                quantity:invoice.quantity, 
                totalFees : invoice.totalFees
            },{where:{invoiceId}});


            await supplyProductModel.update({ quantity: product.quantity - totalNewQuantity }, { where: { productId } });

            res.json({ message: "تم الاسترجاع بنجاح", status: "success" });
            
        }else{
            res.json({ message: "هذا المنتج غير موجود", status: "failed" });
        }
    }else{
        res.json({ message: "هذه الفاتورة غير موجودة", status: "failed" });
    }
    } catch(err){
        console.log(err)
    }
   
})

//get expenses returns invoices
rets.get("/returnedExpenseinvoices", async (req, res) => {
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
            order: [['addedAt', 'DESC']],
        };

        const returnsInvoices = await expenseReturnsModel.findAndCountAll(options);
        totalRecords = returnsInvoices.count;

        if (returnsInvoices.rows.length === 0) {
            res.json({ message: "لا يوجد فواتير شراء", status: "failed" });
            return;
        }

        const result = [];

        for (let i = 0; i < returnsInvoices.rows.length; i++) {

            const returnInvoice = returnsInvoices.rows[i];

            returnInvoice.storages = JSON.parse(returnInvoice.storages);

            returnInvoice.storages.map( async storage =>{
                let completeStorage = await storagesModel.findOne({ raw: true, where:{storageId:storage.id} })

                return storage['storageName'] = completeStorage.storageName
            })

            let invoice = null

            invoice = await invoicesModel.findOne({ raw: true, where: { invoiceId : returnInvoice.invoice_id } });
            
            let product = null;
           
            if (invoice.supplyProduct_id) {
                product = await supplyProductModel.findOne({ raw: true, where: { productId: invoice.supplyProduct_id } });
            }
           
            let quantity = invoice.quantity;
           
            let totalFees = invoice.totalFees;
           
            
            let user = null;
           
            let session = null;
           
            if (invoice.session_id) {
                session = await sessionModel.findOne({ raw: true, where: { sessionId: invoice.session_id, storage_id:invoice.storage_id } });
                if (session) {
                    
                    
                    user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                }
            }

            let storage = null;
            let storageData = null


            const updatedInvoice = {
                ...returnInvoice,
                ...invoice,
                product,
                quantity,
                totalFees,
                user,
                storage,
                storageData
            };

            result.push(updatedInvoice);
        }


        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('returnedTotalFees')), 'totalSum'],
            ],
        };


        const totals = await expenseReturnsModel.findAll(totalOptions);
        
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
rets.get("/todayReturnedExpenseinvoices", async (req, res) => {
    
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
                addedAt: { [op.gte]: moment().subtract(hours, 'hours').format('YYYY-MM-DD HH:mm:ss')} 
            },
            order: [['addedAt', 'DESC']],
        };

        const returnsInvoices = await expenseReturnsModel.findAndCountAll(options);
        totalRecords = returnsInvoices.count;

        if (returnsInvoices.rows.length === 0) {
            res.json({ message: "لا يوجد فواتير شراء", status: "failed" });
            return;
        }

        const result = [];

        for (let i = 0; i < returnsInvoices.rows.length; i++) {
            const returnInvoice = returnsInvoices.rows[i];

            returnInvoice.storages = JSON.parse(returnInvoice.storages);

            returnInvoice.storages.map( async storage =>{
                let completeStorage = await storagesModel.findOne({ raw: true, where:{storageId:storage.id} })
                
                return storage['storageName'] = completeStorage.storageName
            })

            let invoice = null

            invoice = await invoicesModel.findOne({ raw: true, where: { invoiceId : returnInvoice.invoice_id } });
            
            let product = null;
           
            if (invoice.supplyProduct_id) {
                product = await supplyProductModel.findOne({ raw: true, where: { productId: invoice.supplyProduct_id } });
            }
           
            let quantity = invoice.quantity;
           
            let totalFees = invoice.totalFees;
           
            
            let user = null;
           
            let session = null;
           
            if (invoice.session_id) {
                session = await sessionModel.findOne({ raw: true, where: { sessionId: invoice.session_id, storage_id:invoice.storage_id } });
                if (session) {
                    
                    
                    user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                }
            }

            let storage = null;
            let storageData = null


            const updatedInvoice = {
                ...returnInvoice,
                ...invoice,
                product,
                quantity,
                totalFees,
                user,
                storage,
                storageData
            };

            result.push(updatedInvoice);
        }


        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('returnedTotalFees')), 'totalSum'],
            ],
        };


        const totals = await expenseReturnsModel.findAll(totalOptions);
        
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
rets.get("/last7DaysReturnedExpenseinvoices", async (req, res) => {
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
                addedAt: { [op.gte]: moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss') }
            },
            order: [['addedAt', 'DESC']],
        };

        const returnsInvoices = await expenseReturnsModel.findAndCountAll(options);
        totalRecords = returnsInvoices.count;

        if (returnsInvoices.rows.length === 0) {
            res.json({ message: "لا يوجد فواتير شراء", status: "failed" });
            return;
        }

        const result = [];

        for (let i = 0; i < returnsInvoices.rows.length; i++) {
            const returnInvoice = returnsInvoices.rows[i];

            returnInvoice.storages = JSON.parse(returnInvoice.storages);

            returnInvoice.storages.map( async storage =>{
                let completeStorage = await storagesModel.findOne({ raw: true, where:{storageId:storage.id} })
                
                return storage['storageName'] = completeStorage.storageName
            })

            let invoice = null

            invoice = await invoicesModel.findOne({ raw: true, where: { invoiceId : returnInvoice.invoice_id } });
            
            let product = null;
           
            if (invoice.supplyProduct_id) {
                product = await supplyProductModel.findOne({ raw: true, where: { productId: invoice.supplyProduct_id } });
            }
           
            let quantity = invoice.quantity;
           
            let totalFees = invoice.totalFees;
           
            
            let user = null;
           
            let session = null;
           
            if (invoice.session_id) {
                session = await sessionModel.findOne({ raw: true, where: { sessionId: invoice.session_id, storage_id:invoice.storage_id } });
                if (session) {
                    
                    
                    user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                }
            }

            let storage = null;
            let storageData = null


            const updatedInvoice = {
                ...returnInvoice,
                ...invoice,
                product,
                quantity,
                totalFees,
                user,
                storage,
                storageData
            };

            result.push(updatedInvoice);
        }


        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('returnedTotalFees')), 'totalSum'],
            ],
        };


        const totals = await expenseReturnsModel.findAll(totalOptions);
        
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
rets.get("/last30DaysReturnedExpenseinvoices", async (req, res) => {
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
                addedAt: { [op.gte]: moment().subtract(30, 'days').format('YYYY-MM-DD HH:mm:ss') }
            },
            order: [['addedAt', 'DESC']],
        };

        const returnsInvoices = await expenseReturnsModel.findAndCountAll(options);
        totalRecords = returnsInvoices.count;

        if (returnsInvoices.rows.length === 0) {
            res.json({ message: "لا يوجد فواتير شراء", status: "failed" });
            return;
        }

        const result = [];

        for (let i = 0; i < returnsInvoices.rows.length; i++) {
            const returnInvoice = returnsInvoices.rows[i];

            returnInvoice.storages = JSON.parse(returnInvoice.storages);

            returnInvoice.storages.map( async storage =>{
                let completeStorage = await storagesModel.findOne({ raw: true, where:{storageId:storage.id} })
                
                return storage['storageName'] = completeStorage.storageName
            })

            let invoice = null

            invoice = await invoicesModel.findOne({ raw: true, where: { invoiceId : returnInvoice.invoice_id } });
            
            let product = null;
           
            if (invoice.supplyProduct_id) {
                product = await supplyProductModel.findOne({ raw: true, where: { productId: invoice.supplyProduct_id } });
            }
           
            let quantity = invoice.quantity;
           
            let totalFees = invoice.totalFees;
           
            
            let user = null;
           
            let session = null;
           
            if (invoice.session_id) {
                session = await sessionModel.findOne({ raw: true, where: { sessionId: invoice.session_id, storage_id:invoice.storage_id } });
                if (session) {
                    
                    
                    user = await userModel.findOne({ raw: true, where: { userId: session.user_id }, attributes: { exclude: ['password'] } });
                }
            }

            let storage = null;
            let storageData = null


            const updatedInvoice = {
                ...returnInvoice,
                ...invoice,
                product,
                quantity,
                totalFees,
                user,
                storage,
                storageData
            };

            result.push(updatedInvoice);
        }


        const totalOptions = {
            raw: true,
            attributes:[
                [Sequelize.fn('SUM', Sequelize.col('returnedTotalFees')), 'totalSum'],
            ],
        };


        const totals = await expenseReturnsModel.findAll(totalOptions);
        
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

module.exports = rets