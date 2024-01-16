const reports = require('express').Router();
const e = require('express');
const supplyProductModel = require('../models/supplyProduct.model');
const supplyNameModel = require('../models/supplyName.model');
const supplyTypeModel = require('../models/supplyType.model');
const carModelsModel = require('../models/carModels.model');
const carBrandsModel = require('../models/carBrands.model');
const invoicesModel = require("../models/invoices.model");
const expenseReturnsModel = require("../models/expenseReturns");
const productStoragesModel = require('../models/productStorages.model');
const sessionModel = require('../models/sessions.model');
const userModel = require('../models/user.model');
const Sequelize = require('sequelize');
const storagesModel = require('../models/storages.model');
const orderItemModel = require('../models/orderItems.model');
const moment = require('moment');
const op = Sequelize.Op

//get PRODUCTS reports
reports.get("/productsReports", async (req, res) => {
    try {

        let {
            storageId,
            piecePrice_lt,
            piecePrice_gt,
            piecePurchasePrice_lt,
            piecePurchasePrice_gt,
            quantity_lt,
            quantity_gt,
            manufacturerCountery,
            date_from,
            date_to,
            prdouct_added_from,
            prdouct_added_to,
            order_by_column,
            order_type,
            prespective_type // revenue, expense, returned_sales, returned_expenses
        } = req.query;

        if (!order_by_column || order_by_column == null || order_by_column == undefined || order_by_column == '') {
            order_by_column = 'productName'
        }

        if (!order_type || order_type == null || order_type == undefined || order_type == '') {
            order_type = 'ASC'
        }



        const options = {
            raw: true,
            attributes: [
                "productId",
                "barcode",
                "productName",
                "manufacturerCountery",
                "quantity",
                "piecePurchasePrice",
                "piecePrice",
                "addedAt",

            ],
            where: {
                isDeleted: "0",
                piecePrice: {
                    [op.and]: [
                        piecePrice_lt ? { [op.gte]: piecePrice_lt } : Sequelize.col("piecePrice"),
                        piecePrice_gt ? { [op.lte]: piecePrice_gt } : Sequelize.col("piecePrice")
                    ]
                },
                piecePurchasePrice: {
                    [op.and]: [
                        piecePurchasePrice_lt ? { [op.gte]: piecePurchasePrice_lt } : Sequelize.col("piecePurchasePrice"),
                        piecePurchasePrice_gt ? { [op.lte]: piecePurchasePrice_gt } : Sequelize.col("piecePurchasePrice")
                    ]
                },
                quantity: {
                    [op.and]: [
                        quantity_lt ? { [op.gte]: quantity_lt } : Sequelize.col("quantity"),
                        quantity_gt ? { [op.lte]: quantity_gt } : Sequelize.col("quantity")
                    ]
                },
                addedAt: {
                    [op.and]: [
                        prdouct_added_from ? { [op.gte]: moment(prdouct_added_from, 'YYYY-MM-DD').toDate() } : Sequelize.col("addedAt"),
                        prdouct_added_to ? { [op.lte]: moment(prdouct_added_to, 'YYYY-MM-DD').toDate() } : Sequelize.col("addedAt")
                    ]
                },

            },
            order: [
                [Sequelize.col(order_by_column), order_type]
            ],

        };


        if (manufacturerCountery) {
            options.where["manufacturerCountery"] = manufacturerCountery
        }

        if (prespective_type) {

            if (prespective_type == "revenue") {
                options.attributes.push(
                    [Sequelize.literal(`
                         (
                            SELECT COUNT(*) FROM invoices 
                            ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS ( 
                                SELECT * FROM orderitems WHERE session_id = invoices.session_id AND 
                                product_id = ${Sequelize.col('productId').col} 
                            )
                        )`), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`
                    (
                        SELECT SUM(fee) 
                        FROM orderitems 
                        WHERE orderitems.product_id = supplyproduct.productId
                        AND orderitems.session_id IN (
                            SELECT session_id
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                          )
                    )`
                    
                    ), 'totalFeesSum']
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                              SELECT * 
                              FROM invoices 
                              ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS (
                                SELECT * 
                                FROM orderitems 
                                WHERE session_id = invoices.session_id 
                                AND product_id = ${Sequelize.col('productId').col}
                              )
                            )
                          `),
                    }
                ];

            } else if (prespective_type == "expense") {

                options.attributes.push(
                    [Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id =${Sequelize.col('productId').col} AND
                            type = "expense"
                          )`), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`(SELECT SUM(totalFees) 
                            FROM invoices 
                            ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id = supplyproduct.productId)`),
                        'totalFeesSum'
                    ]
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                                SELECT *
                                FROM invoices
                                ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id =${Sequelize.col('productId').col} AND
                                type = "expense"
                              )
                            
                          `),
                    }
                ];
            } else if (prespective_type == "returned_sales") {

                options.attributes.push(
                    [Sequelize.literal(`
                        (
                        
                            SELECT COUNT(*) FROM invoices 
                            ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS 
                            ( 
                                SELECT * FROM returnedinvoices 
                                WHERE invoice_id = invoices.invoiceId AND EXISTS 
                                ( 
                                    SELECT * FROM orderitems 
                                    WHERE orderitemId = returnedinvoices.orderItem_id 
                                    AND product_id = ${Sequelize.col('productId').col}
                                ) 
                            )
                        ) 
                        
                        `), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`(SELECT SUM(fee) 
                            FROM orderitems 
                            WHERE product_id = supplyproduct.productId AND
                            isReturned = "1") AND orderitems.session_id IN (
                                SELECT session_id
                                FROM invoices
                                ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                              )
                            `),
                        'totalFeesSum'
                    ]
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                                SELECT * FROM invoices 
                                ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS 
                                ( 
                                    SELECT * FROM returnedinvoices 
                                    WHERE invoice_id = invoices.invoiceId AND EXISTS 
                                    ( 
                                        SELECT * FROM orderitems 
                                        WHERE orderitemId = returnedinvoices.orderItem_id 
                                        AND product_id = ${Sequelize.col('productId').col}
                                    ) 
                                )
                              )
                            
                          `),
                    }
                ];
            } else if (prespective_type == "returned_expenses") {
                options.attributes.push(
                    [Sequelize.literal(`
                    (
                        SELECT COUNT(*) FROM invoices 
                        WHERE type = "expense" 
                        AND JSON_EXTRACT(invoices.product, '$.productId') = ${Sequelize.col('productId').col}
                        AND EXISTS 
                        ( 
                            SELECT * FROM expensereturns 
                            ${checkDatesBetween(date_from, date_to, 'expensereturns')} invoice_id = invoices.invoiceId 
                        )
                    )`), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`
                    (
                            SELECT SUM(returnedTotalFees) 
                            FROM expensereturns 
                            ${checkDatesBetween(date_from, date_to, 'expensereturns')} EXISTS (
                                SELECT * FROM invoices
                                WHERE invoiceId = expensereturns.invoice_id 
                                AND type = "expense" 
                                AND JSON_EXTRACT(invoices.product, '$.productId') = ${Sequelize.col('productId').col}
                            )
                    )
                        `),
                        'totalFeesSum'
                    ]
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                        EXISTS (
                            SELECT * FROM invoices 
                            WHERE type = "expense" 
                            AND JSON_EXTRACT(invoices.product, '$.productId') = ${Sequelize.col('productId').col}
                            AND EXISTS 
                            ( 
                                SELECT * FROM expensereturns 
                                ${checkDatesBetween(date_from, date_to, 'expensereturns')} invoice_id = invoices.invoiceId 
                            ) 
                        )
                        
                      `),
                    }
                ];
            } else if (prespective_type == "total_earn") {
                

                options.attributes.push(
                    [Sequelize.literal(`
                    (
                            SELECT SUM(fee) 
                            FROM orderitems 
                            WHERE orderitems.product_id = supplyproduct.productId
                            AND orderitems.session_id IN (
                                SELECT session_id
                                FROM invoices
                                ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                            ) 
                    ) - 
                    (
                        SELECT SUM(JSON_EXTRACT(orderitems.product, '$.piecePurchasePrice') * quantity) 
                        FROM orderitems 
                        WHERE orderitems.product_id = supplyproduct.productId
                        AND orderitems.session_id IN (
                            SELECT session_id
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                        ) 
                    )
                    
                            
                    `),
                        'totalEarnSum'
                    ]
                )
            }

            // options.order = [
            //     [Sequelize.literal('invoiceCount'), order_type]
            // ]

        }

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

        let items = await supplyProductModel.findAll(options)

        if (storageId) {
            await Promise.all(
                items.map(async (element) => {
                    let productStorage = await productStoragesModel.findOne({
                        raw: true,
                        where: { storage_id: storageId, product_id: element.productId }
                    });
                    return element.quantity = productStorage.quantity
                })
            )

        }

        // console.log(items)
        ///items.slice(0,10)

        
        res.json({ report: items, status: "success" });

    } catch (err) {
        console.error(err);
        res.json({ message: "فشل في جلب البيانات", status: "failed" });
    }
});

//get SUPPLY NAMES reports
reports.get("/supplyNamesReports", async (req, res) => {
    try {

        let {
            date_from,
            date_to,
            order_by_column,
            order_type,
            prespective_type // revenue, expense, returned_sales, returned_expenses
        } = req.query;

        if (!order_by_column || order_by_column == null || order_by_column == undefined || order_by_column == '') {
            order_by_column = 'supply'
        }

        if (!order_type || order_type == null || order_type == undefined || order_type == '') {
            order_type = 'ASC'
        }



        const options = {
            raw: true,
            attributes: [
                "supplyNameId",
                "supply",
            ],
            where: {
                isDeleted: "0",


            },
            order: [
                [Sequelize.col(order_by_column), order_type]
            ],

        };

        if (prespective_type) {

            if (prespective_type == "revenue") {
                options.attributes.push(
                    [Sequelize.literal(`
                        (
                           SELECT COUNT(*) FROM invoices 
                           ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS ( 
                               SELECT * FROM orderitems WHERE session_id = invoices.session_id AND 
                               product_id IN  ( 
                                SELECT productId FROM supplyproducts WHERE supplyName_id = ${Sequelize.col('supplyNameId').col} AND isDeleted = '0'
                              )
                           )
                       )`), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`
                    (
                        SELECT SUM(fee) FROM orderitems WHERE 
                        orderitems.product_id IN ( 
                            SELECT productId FROM supplyproducts WHERE 
                            supplyName_id = ${Sequelize.col('supplyNameId').col} AND isDeleted = '0'

                          ) AND orderitems.session_id IN (
                            SELECT session_id
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                          )
                        )`), 'totalFeesSum']
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                              SELECT * 
                              FROM invoices 
                              ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS (
                                SELECT * 
                                FROM orderitems 
                                WHERE session_id = invoices.session_id 
                                AND product_id IN ( 
                                    SELECT productId FROM supplyproducts WHERE supplyName_id = ${Sequelize.col('supplyNameId').col} AND isDeleted = '0'
                                )
                              )
                            )
                          `),
                    }
                ];

            } else if (prespective_type == "expense") {

                options.attributes.push(
                    [Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id IN ( 
                                SELECT productId FROM supplyproducts WHERE supplyName_id = ${Sequelize.col('supplyNameId').col} AND isDeleted = '0'
                            ) AND
                            type = "expense"
                          )`), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`(SELECT SUM(totalFees) 
                            FROM invoices 
                            ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id IN 
                            ( 
                                SELECT productId FROM supplyproducts WHERE supplyName_id = ${Sequelize.col('supplyNameId').col} AND isDeleted = '0'
                            )
                            )`),
                        'totalFeesSum'
                    ]
                )
                

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                                SELECT *
                                FROM invoices
                                ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id IN ( 
                                    SELECT productId FROM supplyproducts WHERE supplyName_id = ${Sequelize.col('supplyNameId').col} AND isDeleted = '0'
                                ) AND
                                type = "expense"
                              )
                            
                          `),
                    }
                ];
            } else if (prespective_type == "returned_sales") {

                options.attributes.push(
                    [Sequelize.literal(`
                        (
                        
                            SELECT COUNT(*) FROM invoices 
                            ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS 
                            ( 
                                SELECT * FROM returnedinvoices 
                                WHERE invoice_id = invoices.invoiceId AND EXISTS 
                                ( 
                                    SELECT * FROM orderitems 
                                    WHERE orderitemId = returnedinvoices.orderItem_id 
                                    AND product_id IN ( 
                                        SELECT productId FROM supplyproducts WHERE supplyName_id = ${Sequelize.col('supplyNameId').col} AND isDeleted = '0'
                                    )
                                ) 
                            )
                        ) 
                        
                        `), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`
                    (
                        SELECT SUM(fee) 
                            FROM orderitems 
                            WHERE product_id IN ( 
                                SELECT productId FROM supplyproducts WHERE supplyName_id = ${Sequelize.col('supplyNameId').col} AND isDeleted = '0'
                            ) AND
                            isReturned = "1" 
                            AND orderitems.session_id IN (
                                SELECT session_id
                                FROM invoices
                                ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                              )
                    ) 
                    `),
                        'totalFeesSum'
                    ]
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                                SELECT * FROM invoices 
                                ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS 
                                ( 
                                    SELECT * FROM returnedinvoices 
                                    WHERE invoice_id = invoices.invoiceId AND EXISTS 
                                    ( 
                                        SELECT * FROM orderitems 
                                        WHERE orderitemId = returnedinvoices.orderItem_id 
                                        AND product_id IN ( 
                                            SELECT productId FROM supplyproducts WHERE supplyName_id = ${Sequelize.col('supplyNameId').col} AND isDeleted = '0'
                                        )
                                    ) 
                                )
                              )
                            
                          `),
                    }
                ];
            } else if (prespective_type == "returned_expenses") {
                options.attributes.push(
                    [Sequelize.literal(`
                    (
                        SELECT COUNT(*) FROM invoices 
                        WHERE type = "expense" 
                        AND JSON_EXTRACT(invoices.product, '$.productId') IN ( 
                            SELECT productId FROM supplyproducts WHERE supplyName_id = ${Sequelize.col('supplyNameId').col} AND isDeleted = '0'
                        )
                        AND EXISTS 
                        ( 
                            SELECT * FROM expensereturns 
                            ${checkDatesBetween(date_from, date_to, 'expensereturns')} invoice_id = invoices.invoiceId 
                        )
                    )`
                    ), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`
                    (
                            SELECT SUM(returnedTotalFees) 
                            FROM expensereturns 
                            ${checkDatesBetween(date_from, date_to, 'expensereturns')} EXISTS (
                                SELECT * FROM invoices
                                WHERE invoiceId = expensereturns.invoice_id 
                                AND type = "expense" 
                                AND JSON_EXTRACT(invoices.product, '$.productId') IN ( 
                                    SELECT productId FROM supplyproducts WHERE supplyName_id = ${Sequelize.col('supplyNameId').col} AND isDeleted = '0'
                                )
                            )
                    )
                        `),
                        'totalFeesSum'
                    ]
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                                SELECT * 
                                FROM invoices 
                                WHERE type = "expense" 
                                AND JSON_EXTRACT(invoices.product, '$.productId') IN ( 
                                    SELECT productId FROM supplyproducts WHERE supplyName_id = ${Sequelize.col('supplyNameId').col} AND isDeleted = '0'
                                )
                                AND EXISTS 
                                ( 
                                    SELECT * FROM expensereturns 
                                    ${checkDatesBetween(date_from, date_to, 'expensereturns')} invoice_id = invoices.invoiceId 
                                )
                            )
                          `),
                    }
                ];
            } else if (prespective_type == "total_earn") {
                

                options.attributes.push(
                    [Sequelize.literal(`

                    (
                        SELECT SUM(fee) FROM orderitems WHERE 
                        orderitems.product_id IN ( 
                            SELECT productId FROM supplyproducts WHERE 
                            supplyName_id = ${Sequelize.col('supplyNameId').col} AND isDeleted = '0'

                          ) AND orderitems.session_id IN (
                            SELECT session_id
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                          )
                    ) - 
                    (
                        SELECT SUM(JSON_EXTRACT(orderitems.product, '$.piecePurchasePrice') * quantity) FROM orderitems WHERE 
                        orderitems.product_id IN ( 
                            SELECT productId FROM supplyproducts WHERE 
                            supplyName_id = ${Sequelize.col('supplyNameId').col} AND isDeleted = '0'

                          ) AND orderitems.session_id IN (
                            SELECT session_id
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                          )
                    )
                    
                            
                    `),
                        'totalEarnSum'
                    ]
                )
            }

            // options.order = [
            //     [Sequelize.literal('invoiceCount'), order_type]
            // ]

        }

        let items = await supplyNameModel.findAll(options)


        // console.log(items)
        ///items.slice(0,10)

        
        res.json({ report: items, status: "success" });

    } catch (err) {
        console.error(err);
        res.json({ message: "فشل في جلب البيانات", status: "failed" });
    }
});

//get SYPPLY TYPES reports
reports.get("/supplyTypesReports", async (req, res) => {
    try {

        let {
            date_from,
            date_to,
            order_by_column,
            order_type,
            prespective_type // revenue, expense, returned_sales, returned_expenses
        } = req.query;

        if (!order_by_column || order_by_column == null || order_by_column == undefined || order_by_column == '') {
            order_by_column = 'type'
        }

        if (!order_type || order_type == null || order_type == undefined || order_type == '') {
            order_type = 'ASC'
        }



        const options = {
            raw: true,
            attributes: [
                "supplyTypeId",
                "type",
            ],
            where: {
                isDeleted: "0",


            },
            order: [
                [Sequelize.col(order_by_column), order_type]
            ],

        };

        if (prespective_type) {

            if (prespective_type == "revenue") {
                options.attributes.push(
                    [Sequelize.literal(`
                        (
                           SELECT COUNT(*) FROM invoices 
                           ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS ( 
                               SELECT * FROM orderitems WHERE session_id = invoices.session_id AND 
                               product_id IN  ( 
                                    SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND supplyName_id IN (
                                        SELECT supplyNameId FROM supplyNames WHERE supplyType_id =  ${Sequelize.col('supplyTypeId').col} AND isDeleted = '0'

                                    )
                              )
                           )
                       )`), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`
                    (
                        SELECT SUM(fee) FROM orderitems WHERE 
                        orderitems.product_id IN ( 
                            SELECT productId FROM supplyproducts WHERE 
                            isDeleted = '0' AND supplyName_id IN (
                                SELECT supplyNameId FROM supplyNames WHERE supplyType_id = ${Sequelize.col('supplyTypeId').col} AND isDeleted = '0'

                            ) 
                          ) AND orderitems.session_id IN (
                            SELECT session_id
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                          )
                          )`), 'totalFeesSum']
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                              SELECT * 
                              FROM invoices 
                              ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS (
                                SELECT * 
                                FROM orderitems 
                                WHERE session_id = invoices.session_id 
                                AND product_id IN ( 
                                    SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND supplyName_id IN (
                                        SELECT supplyNameId FROM supplyNames WHERE supplyType_id =  ${Sequelize.col('supplyTypeId').col} AND isDeleted = '0'

                                    )
                                )
                              )
                            )
                          `),
                    }
                ];

            } else if (prespective_type == "expense") {

                options.attributes.push(
                    [Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id IN ( 
                                SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND supplyName_id IN (
                                    SELECT supplyNameId FROM supplyNames WHERE supplyType_id = ${Sequelize.col('supplyTypeId').col} AND isDeleted = '0'

                                )
                            ) AND
                            type = "expense"
                          )`), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`(SELECT SUM(totalFees) 
                            FROM invoices 
                            ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id IN 
                            ( 
                                SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND supplyName_id IN (
                                    SELECT supplyNameId FROM supplyNames WHERE supplyType_id =  ${Sequelize.col('supplyTypeId').col} AND isDeleted = '0'

                                )
                            )
                            )`),
                        'totalFeesSum'
                    ]
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                                SELECT *
                                FROM invoices
                                ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id IN ( 
                                    SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND supplyName_id IN (
                                        SELECT supplyNameId FROM supplyNames WHERE supplyType_id = ${Sequelize.col('supplyTypeId').col} AND isDeleted = '0'

                                    )
                                ) AND
                                type = "expense"
                              )
                            
                          `),
                    }
                ];
            } else if (prespective_type == "returned_sales") {

                options.attributes.push(
                    [Sequelize.literal(`
                        (
                        
                            SELECT COUNT(*) FROM invoices 
                            ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS 
                            ( 
                                SELECT * FROM returnedinvoices 
                                WHERE invoice_id = invoices.invoiceId AND EXISTS 
                                ( 
                                    SELECT * FROM orderitems 
                                    WHERE orderitemId = returnedinvoices.orderItem_id 
                                    AND product_id IN ( 
                                        SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND supplyName_id IN (
                                            SELECT supplyNameId FROM supplyNames WHERE supplyType_id = ${Sequelize.col('supplyTypeId').col} AND isDeleted = '0'
    
                                        )
                                    )
                                ) 
                            )
                        ) 
                        
                        `), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`(SELECT SUM(fee) 
                            FROM orderitems 
                            WHERE product_id IN ( 
                                SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND supplyName_id IN (
                                    SELECT supplyNameId FROM supplyNames WHERE supplyType_id = ${Sequelize.col('supplyTypeId').col} AND isDeleted = '0'

                                )
                            ) AND
                            isReturned = "1") AND orderitems.session_id IN (
                                SELECT session_id
                                FROM invoices
                                ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                              )
                            `),
                        'totalFeesSum'
                    ]
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                                SELECT * FROM invoices 
                                ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS 
                                ( 
                                    SELECT * FROM returnedinvoices 
                                    WHERE invoice_id = invoices.invoiceId AND EXISTS 
                                    ( 
                                        SELECT * FROM orderitems 
                                        WHERE orderitemId = returnedinvoices.orderItem_id 
                                        AND product_id IN ( 
                                            SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND supplyName_id IN (
                                                SELECT supplyNameId FROM supplyNames WHERE supplyType_id = ${Sequelize.col('supplyTypeId').col} AND isDeleted = '0'
        
                                            )
                                        )
                                    ) 
                                )
                              )
                            
                          `),
                    }
                ];
            } else if (prespective_type == "returned_expenses") {
                options.attributes.push(
                    [Sequelize.literal(`
                    (
                        SELECT COUNT(*) FROM invoices 
                        WHERE type = "expense" 
                        AND JSON_EXTRACT(invoices.product, '$.productId') IN ( 
                            SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND supplyName_id IN (
                                SELECT supplyNameId FROM supplyNames WHERE supplyType_id = ${Sequelize.col('supplyTypeId').col} AND isDeleted = '0'

                            )
                        )
                        AND EXISTS 
                        ( 
                            SELECT * FROM expensereturns 
                            ${checkDatesBetween(date_from, date_to, 'expensereturns')} invoice_id = invoices.invoiceId 
                        )
                    )`), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`
                    (
                            SELECT SUM(returnedTotalFees) 
                            FROM expensereturns 
                            ${checkDatesBetween(date_from, date_to, 'expensereturns')} EXISTS (
                                SELECT * FROM invoices
                                WHERE invoiceId = expensereturns.invoice_id 
                                AND type = "expense" 
                                AND JSON_EXTRACT(invoices.product, '$.productId') IN ( 
                                    SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND supplyName_id IN (
                                        SELECT supplyNameId FROM supplyNames WHERE supplyType_id = ${Sequelize.col('supplyTypeId').col} AND isDeleted = '0'

                                    )
                                )
                            )
                    )
                        `),
                        'totalFeesSum'
                    ]
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                                SELECT * FROM invoices 
                                WHERE type = "expense" 
                                AND JSON_EXTRACT(invoices.product, '$.productId') IN ( 
                                    SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND supplyName_id IN (
                                        SELECT supplyNameId FROM supplyNames WHERE supplyType_id = ${Sequelize.col('supplyTypeId').col} AND isDeleted = '0'
        
                                    )
                                )
                                AND EXISTS 
                                ( 
                                    SELECT * FROM expensereturns 
                                    ${checkDatesBetween(date_from, date_to, 'expensereturns')} invoice_id = invoices.invoiceId 
                                )
                            )
                          `),
                    }
                ];

            } else if (prespective_type == "total_earn") {
                

                options.attributes.push(
                    [Sequelize.literal(`

                    (
                        SELECT SUM(fee) FROM orderitems WHERE 
                        orderitems.product_id IN ( 
                            SELECT productId FROM supplyproducts WHERE 
                            isDeleted = '0' AND supplyName_id IN (
                                SELECT supplyNameId FROM supplyNames WHERE supplyType_id = ${Sequelize.col('supplyTypeId').col} AND isDeleted = '0'

                            ) 
                          ) AND orderitems.session_id IN (
                            SELECT session_id
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                          )
                    ) - 
                    (
                         SELECT SUM(JSON_EXTRACT(orderitems.product, '$.piecePurchasePrice') * quantity) FROM orderitems WHERE 
                        orderitems.product_id IN ( 
                            SELECT productId FROM supplyproducts WHERE 
                            isDeleted = '0' AND supplyName_id IN (
                                SELECT supplyNameId FROM supplyNames WHERE supplyType_id = ${Sequelize.col('supplyTypeId').col} AND isDeleted = '0'

                            ) 
                          ) AND orderitems.session_id IN (
                            SELECT session_id
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                          )
                    )
                    
                            
                    `),
                        'totalEarnSum'
                    ]
                )
            }

            // options.order = [
            //     [Sequelize.literal('invoiceCount'), order_type]
            // ]

        }

        let items = await supplyTypeModel.findAll(options)


        // console.log(items)
        ///items.slice(0,10)

        
        res.json({ report: items, status: "success" });

    } catch (err) {
        console.error(err);
        res.json({ message: "فشل في جلب البيانات", status: "failed" });
    }
});

//get Car Models reports
reports.get("/carModelsReports", async (req, res) => {
    try {

        let {
            date_from,
            date_to,
            order_by_column,
            order_type,
            prespective_type // revenue, expense, returned_sales, returned_expenses
        } = req.query;

        if (!order_by_column || order_by_column == null || order_by_column == undefined || order_by_column == '') {
            order_by_column = 'model'
        }

        if (!order_type || order_type == null || order_type == undefined || order_type == '') {
            order_type = 'ASC'
        }



        const options = {
            raw: true,
            include: [{ model: carBrandsModel }],
            attributes: [
                "carModelId",
                "model",
            ],
            where: {
                isDeleted: "0",


            },
            order: [
                [Sequelize.col(order_by_column), order_type]
            ],

        };

        if (prespective_type) {

            if (prespective_type == "revenue") {
                options.attributes.push(
                    [Sequelize.literal(`
                        (
                           SELECT COUNT(*) FROM invoices 
                           ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS ( 
                               SELECT * FROM orderitems WHERE session_id = invoices.session_id AND 
                               product_id IN  ( 
                                SELECT productId FROM supplyproducts WHERE carModel_id = ${Sequelize.col('carModelId').col} AND isDeleted = '0'
                              )
                           )
                       )`), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`
                    (
                        SELECT SUM(fee) FROM orderitems WHERE 
                        orderitems.product_id IN ( 
                            SELECT productId FROM supplyproducts WHERE 
                            carModel_id = ${Sequelize.col('carModelId').col} AND isDeleted = '0'

                          ) AND orderitems.session_id IN (
                            SELECT session_id
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                          )
                        )`), 'totalFeesSum']
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                              SELECT * 
                              FROM invoices 
                              ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS (
                                SELECT * 
                                FROM orderitems 
                                WHERE session_id = invoices.session_id 
                                AND product_id IN ( 
                                    SELECT productId FROM supplyproducts WHERE carModel_id = ${Sequelize.col('carModelId').col} AND isDeleted = '0'
                                )
                              )
                            )
                          `),
                    }
                ];

            } else if (prespective_type == "expense") {

                options.attributes.push(
                    [Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id IN ( 
                                SELECT productId FROM supplyproducts WHERE carModel_id = ${Sequelize.col('carModelId').col} AND isDeleted = '0'
                            ) AND
                            type = "expense"
                          )`), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`(SELECT SUM(totalFees) 
                            FROM invoices 
                            ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id IN 
                            ( 
                                SELECT productId FROM supplyproducts WHERE carModel_id = ${Sequelize.col('carModelId').col} AND isDeleted = '0'
                            )
                            )`),
                        'totalFeesSum'
                    ]
                )
                

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                                SELECT *
                                FROM invoices
                                ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id IN ( 
                                    SELECT productId FROM supplyproducts WHERE carModel_id = ${Sequelize.col('carModelId').col} AND isDeleted = '0'
                                ) AND
                                type = "expense"
                              )
                            
                          `),
                    }
                ];
            } else if (prespective_type == "returned_sales") {

                options.attributes.push(
                    [Sequelize.literal(`
                        (
                        
                            SELECT COUNT(*) FROM invoices 
                            ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS 
                            ( 
                                SELECT * FROM returnedinvoices 
                                WHERE invoice_id = invoices.invoiceId AND EXISTS 
                                ( 
                                    SELECT * FROM orderitems 
                                    WHERE orderitemId = returnedinvoices.orderItem_id 
                                    AND product_id IN ( 
                                        SELECT productId FROM supplyproducts WHERE carModel_id = ${Sequelize.col('carModelId').col} AND isDeleted = '0'
                                    )
                                ) 
                            )
                        ) 
                        
                        `), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`
                    (
                        SELECT SUM(fee) 
                            FROM orderitems 
                            WHERE product_id IN ( 
                                SELECT productId FROM supplyproducts WHERE carModel_id = ${Sequelize.col('carModelId').col} AND isDeleted = '0'
                            ) AND
                            isReturned = "1" 
                            AND orderitems.session_id IN (
                                SELECT session_id
                                FROM invoices
                                ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                              )
                    ) 
                    `),
                        'totalFeesSum'
                    ]
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                                SELECT * FROM invoices 
                                ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS 
                                ( 
                                    SELECT * FROM returnedinvoices 
                                    WHERE invoice_id = invoices.invoiceId AND EXISTS 
                                    ( 
                                        SELECT * FROM orderitems 
                                        WHERE orderitemId = returnedinvoices.orderItem_id 
                                        AND product_id IN ( 
                                            SELECT productId FROM supplyproducts WHERE carModel_id = ${Sequelize.col('carModelId').col} AND isDeleted = '0'
                                        )
                                    ) 
                                )
                              )
                            
                          `),
                    }
                ];
            } else if (prespective_type == "returned_expenses") {
                options.attributes.push(
                    [Sequelize.literal(`
                    (
                        SELECT COUNT(*) FROM invoices 
                        WHERE type = "expense" 
                        AND JSON_EXTRACT(invoices.product, '$.productId') IN ( 
                            SELECT productId FROM supplyproducts WHERE carModel_id = ${Sequelize.col('carModelId').col} AND isDeleted = '0'
                        )
                        AND EXISTS 
                        ( 
                            SELECT * FROM expensereturns 
                            ${checkDatesBetween(date_from, date_to, 'expensereturns')} invoice_id = invoices.invoiceId 
                        )
                    )`
                    ), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`
                    (
                            SELECT SUM(returnedTotalFees) 
                            FROM expensereturns 
                            ${checkDatesBetween(date_from, date_to, 'expensereturns')} EXISTS (
                                SELECT * FROM invoices
                                WHERE invoiceId = expensereturns.invoice_id 
                                AND type = "expense" 
                                AND JSON_EXTRACT(invoices.product, '$.productId') IN ( 
                                    SELECT productId FROM supplyproducts WHERE carModel_id = ${Sequelize.col('carModelId').col} AND isDeleted = '0'
                                )
                            )
                    )
                        `),
                        'totalFeesSum'
                    ]
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                                SELECT * 
                                FROM invoices 
                                WHERE type = "expense" 
                                AND JSON_EXTRACT(invoices.product, '$.productId') IN ( 
                                    SELECT productId FROM supplyproducts WHERE carModel_id = ${Sequelize.col('carModelId').col} AND isDeleted = '0'
                                )
                                AND EXISTS 
                                ( 
                                    SELECT * FROM expensereturns 
                                    ${checkDatesBetween(date_from, date_to, 'expensereturns')} invoice_id = invoices.invoiceId 
                                )
                            )
                          `),
                    }
                ];
            } else if (prespective_type == "total_earn") {
                

                options.attributes.push(
                    [Sequelize.literal(`

                    (
                        SELECT SUM(fee) FROM orderitems WHERE 
                        orderitems.product_id IN ( 
                            SELECT productId FROM supplyproducts WHERE 
                            carModel_id = ${Sequelize.col('carModelId').col} AND isDeleted = '0'

                          ) AND orderitems.session_id IN (
                            SELECT session_id
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                          )
                    ) - 
                    (
                         SELECT SUM(JSON_EXTRACT(orderitems.product, '$.piecePurchasePrice') * quantity) FROM orderitems WHERE 
                         orderitems.product_id IN ( 
                             SELECT productId FROM supplyproducts WHERE 
                             carModel_id = ${Sequelize.col('carModelId').col} AND isDeleted = '0'
 
                           ) AND orderitems.session_id IN (
                             SELECT session_id
                             FROM invoices
                             ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                           )
                    )
                    
                            
                    `),
                        'totalEarnSum'
                    ]
                )
            }

            // options.order = [
            //     [Sequelize.literal('invoiceCount'), order_type]
            // ]

        }

        let items = await carModelsModel.findAll(options)


        // console.log(items)
        ///items.slice(0,10)

        
        res.json({ report: items, status: "success" });

    } catch (err) {
        console.error(err);
        res.json({ message: "فشل في جلب البيانات", status: "failed" });
    }
});

//get CAR BRANDS reports
reports.get("/carBrandsReports", async (req, res) => {
    try {

        let {
            date_from,
            date_to,
            order_by_column,
            order_type,
            prespective_type // revenue, expense, returned_sales, returned_expenses
        } = req.query;

        if (!order_by_column || order_by_column == null || order_by_column == undefined || order_by_column == '') {
            order_by_column = 'brand'
        }

        if (!order_type || order_type == null || order_type == undefined || order_type == '') {
            order_type = 'ASC'
        }



        const options = {
            raw: true,
            attributes: [
                "carBrandId",
                "brand",
            ],
            where: {
                isDeleted: "0",


            },
            order: [
                [Sequelize.col(order_by_column), order_type]
            ],

        };

        if (prespective_type) {

            if (prespective_type == "revenue") {
                options.attributes.push(
                    [Sequelize.literal(`
                        (
                           SELECT COUNT(*) FROM invoices 
                           ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS ( 
                               SELECT * FROM orderitems WHERE session_id = invoices.session_id AND 
                               product_id IN  ( 
                                    SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND carModel_id IN (
                                        SELECT carModelId FROM carModels WHERE carBrand_id =  ${Sequelize.col('carBrandId').col} AND isDeleted = '0'

                                    )
                              )
                           )
                       )`), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`
                    (
                        SELECT SUM(fee) FROM orderitems WHERE 
                        orderitems.product_id IN ( 
                            SELECT productId FROM supplyproducts WHERE 
                            isDeleted = '0' AND carModel_id IN (
                                SELECT carModelId FROM carModels WHERE carBrand_id = ${Sequelize.col('carBrandId').col} AND isDeleted = '0'

                            ) 
                          ) AND orderitems.session_id IN (
                            SELECT session_id
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                          )
                          )`), 'totalFeesSum']
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                              SELECT * 
                              FROM invoices 
                              ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS (
                                SELECT * 
                                FROM orderitems 
                                WHERE session_id = invoices.session_id 
                                AND product_id IN ( 
                                    SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND carModel_id IN (
                                        SELECT carModelId FROM carModels WHERE carBrand_id =  ${Sequelize.col('carBrandId').col} AND isDeleted = '0'

                                    )
                                )
                              )
                            )
                          `),
                    }
                ];

            } else if (prespective_type == "expense") {

                options.attributes.push(
                    [Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id IN ( 
                                SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND carModel_id IN (
                                    SELECT carModelId FROM carModels WHERE carBrand_id = ${Sequelize.col('carBrandId').col} AND isDeleted = '0'

                                )
                            ) AND
                            type = "expense"
                          )`), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`(SELECT SUM(totalFees) 
                            FROM invoices 
                            ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id IN 
                            ( 
                                SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND carModel_id IN (
                                    SELECT carModelId FROM carModels WHERE carBrand_id =  ${Sequelize.col('carBrandId').col} AND isDeleted = '0'

                                )
                            )
                            )`),
                        'totalFeesSum'
                    ]
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                                SELECT *
                                FROM invoices
                                ${checkDatesBetween(date_from, date_to, 'invoices')} invoices.supplyProduct_id IN ( 
                                    SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND carModel_id IN (
                                        SELECT carModelId FROM carModels WHERE carBrand_id = ${Sequelize.col('carBrandId').col} AND isDeleted = '0'

                                    )
                                ) AND
                                type = "expense"
                              )
                            
                          `),
                    }
                ];
            } else if (prespective_type == "returned_sales") {

                options.attributes.push(
                    [Sequelize.literal(`
                        (
                        
                            SELECT COUNT(*) FROM invoices 
                            ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS 
                            ( 
                                SELECT * FROM returnedinvoices 
                                WHERE invoice_id = invoices.invoiceId AND EXISTS 
                                ( 
                                    SELECT * FROM orderitems 
                                    WHERE orderitemId = returnedinvoices.orderItem_id 
                                    AND product_id IN ( 
                                        SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND carModel_id IN (
                                            SELECT carModelId FROM carModels WHERE carBrand_id = ${Sequelize.col('carBrandId').col} AND isDeleted = '0'
    
                                        )
                                    )
                                ) 
                            )
                        ) 
                        
                        `), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`(SELECT SUM(fee) 
                            FROM orderitems 
                            WHERE product_id IN ( 
                                SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND carModel_id IN (
                                    SELECT carModelId FROM carModels WHERE carBrand_id = ${Sequelize.col('carBrandId').col} AND isDeleted = '0'

                                )
                            ) AND
                            isReturned = "1") AND orderitems.session_id IN (
                                SELECT session_id
                                FROM invoices
                                ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                              )
                            `),
                        'totalFeesSum'
                    ]
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                                SELECT * FROM invoices 
                                ${checkDatesBetween(date_from, date_to, 'invoices')} EXISTS 
                                ( 
                                    SELECT * FROM returnedinvoices 
                                    WHERE invoice_id = invoices.invoiceId AND EXISTS 
                                    ( 
                                        SELECT * FROM orderitems 
                                        WHERE orderitemId = returnedinvoices.orderItem_id 
                                        AND product_id IN ( 
                                            SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND carModel_id IN (
                                                SELECT carModelId FROM carModels WHERE carBrand_id = ${Sequelize.col('carBrandId').col} AND isDeleted = '0'
        
                                            )
                                        )
                                    ) 
                                )
                              )
                            
                          `),
                    }
                ];
            } else if (prespective_type == "returned_expenses") {
                options.attributes.push(
                    [Sequelize.literal(`
                    (
                        SELECT COUNT(*) FROM invoices 
                        WHERE type = "expense" 
                        AND JSON_EXTRACT(invoices.product, '$.productId') IN ( 
                            SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND carModel_id IN (
                                SELECT carModelId FROM carModels WHERE carBrand_id = ${Sequelize.col('carBrandId').col} AND isDeleted = '0'

                            )
                        )
                        AND EXISTS 
                        ( 
                            SELECT * FROM expensereturns 
                            ${checkDatesBetween(date_from, date_to, 'expensereturns')} invoice_id = invoices.invoiceId 
                        )
                    )`), 'invoiceCount']
                )

                options.attributes.push(
                    [Sequelize.literal(`
                    (
                            SELECT SUM(returnedTotalFees) 
                            FROM expensereturns 
                            ${checkDatesBetween(date_from, date_to, 'expensereturns')} EXISTS (
                                SELECT * FROM invoices
                                WHERE invoiceId = expensereturns.invoice_id 
                                AND type = "expense" 
                                AND JSON_EXTRACT(invoices.product, '$.productId') IN ( 
                                    SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND carModel_id IN (
                                        SELECT carModelId FROM carModels WHERE carBrand_id = ${Sequelize.col('carBrandId').col} AND isDeleted = '0'

                                    )
                                )
                            )
                    )
                        `),
                        'totalFeesSum'
                    ]
                )

                options.where[op.and] = [
                    // existing conditions
                    {
                        [op.and]: Sequelize.literal(`
                             EXISTS (
                                SELECT * FROM invoices 
                                WHERE type = "expense" 
                                AND JSON_EXTRACT(invoices.product, '$.productId') IN ( 
                                    SELECT productId FROM supplyproducts  WHERE isDeleted = '0' AND carModel_id IN (
                                        SELECT carModelId FROM carModels WHERE carBrand_id = ${Sequelize.col('carBrandId').col} AND isDeleted = '0'
        
                                    )
                                )
                                AND EXISTS 
                                ( 
                                    SELECT * FROM expensereturns 
                                    ${checkDatesBetween(date_from, date_to, 'expensereturns')} invoice_id = invoices.invoiceId 
                                )
                            )
                          `),
                    }
                ];

            } else if (prespective_type == "total_earn") {
                

                options.attributes.push(
                    [Sequelize.literal(`

                    (
                        SELECT SUM(fee) FROM orderitems WHERE 
                        orderitems.product_id IN ( 
                            SELECT productId FROM supplyproducts WHERE 
                            isDeleted = '0' AND carModel_id IN (
                                SELECT carModelId FROM carModels WHERE carBrand_id = ${Sequelize.col('carBrandId').col} AND isDeleted = '0'

                            ) 
                          ) AND orderitems.session_id IN (
                            SELECT session_id
                            FROM invoices
                            ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                          )
                    ) - 
                    (
                         SELECT SUM(JSON_EXTRACT(orderitems.product, '$.piecePurchasePrice') * quantity) FROM orderitems WHERE 
                         orderitems.product_id IN ( 
                             SELECT productId FROM supplyproducts WHERE 
                             isDeleted = '0' AND carModel_id IN (
                                 SELECT carModelId FROM carModels WHERE carBrand_id = ${Sequelize.col('carBrandId').col} AND isDeleted = '0'
 
                             ) 
                           ) AND orderitems.session_id IN (
                             SELECT session_id
                             FROM invoices
                             ${checkDatesBetween(date_from, date_to, 'invoices',true)}
                           )
                    )
                    
                            
                    `),
                        'totalEarnSum'
                    ]
                )
            }

            // options.order = [
            //     [Sequelize.literal('invoiceCount'), order_type]
            // ]

        }

        let items = await carBrandsModel.findAll(options)


        // console.log(items)
        ///items.slice(0,10)

        
        res.json({ report: items, status: "success" });

    } catch (err) {
        console.error(err);
        res.json({ message: "فشل في جلب البيانات", status: "failed" });
    }
});

function checkDatesBetween(date1, date2, table, completed) {
    if (date1 && date2) {

        if (table == 'invoices') {
            return `WHERE creationDate BETWEEN '${date1}' and '${date2}' ${completed ? '' : 'AND'} `
        } else if (table == 'expensereturns') {
            return `WHERE addedAt BETWEEN '${date1}' and '${date2}' ${completed ? '' : 'AND'}`
        }

    } else if (date1) {

        if (table == 'invoices') {
            return `WHERE creationDate >= '${date1}' ${completed ? '' : 'AND'}`
        } else if (table == 'expensereturns') {
            return `WHERE addedAt >= '${date1}' ${completed ? '' : 'AND'}`
        }

    } else if (date2) {

        if (table == 'invoices') {
            return `WHERE creationDate <= '${date2}' ${completed ? '' : 'AND'}`
        } else if (table == 'expensereturns') {
            return `WHERE addedAt <= '${date2}' ${completed ? '' : 'AND'}`
        }


    } else {
        return completed ? `` : `WHERE`

    }
}

module.exports = reports