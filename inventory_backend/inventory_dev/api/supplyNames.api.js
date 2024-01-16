const supplyName = require('express').Router();
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
const db = require('../models/sequelize.model');
const moment = require('moment');
const manufacturerCountriesModel = require('../models/manufacturerCounter.model');
const {check , validationResult} = require('express-validator');
const Sequelize = require('sequelize');
const e = require('express');
const carBrandsModel = require('../models/carBrands.model')
const carModelsModel = require('../models/carModels.model');
const supplyTypeModel = require('../models/supplyType.model')
const supplyNameModel = require("../models/supplyName.model");
const supplyProductModel = require('../models/supplyProduct.model');
const releaseYearsModel = require('../models/releaseYear.model');
const op=Sequelize.Op

supplyName.get('/allsupplynames',async(req,res)=>{
    let supplyNames = await supplyNameModel.findAll({raw:true , where:{isDeleted:"0"}});
    if(supplyNames[0]){
        for (let i = 0; i < supplyNames.length; i++) {
            let supplyType  = await supplyTypeModel.findOne({raw:true , where:{supplyTypeId:supplyNames[0].supplyType_id}});
            supplyNames[i].supplyType = supplyType;        
        }
        res.json({supplyNames,status:"success"});
    }   
    else{
        res.json({message:"There is no supply names",status:"failed"})
    }
})
supplyName.get('/supplyname/:id',async(req,res)=>{
    let supplyNameId = req.params.id;
    let supplyName = await supplyNameModel.findOne({raw:true , where:{supplyNameId}});
    if(supplyName){
        res.json({supplyName,status:"success"})
    }
    else{
        res.json({message:"invalid supplyName id",status:"failed"})
    }
})
supplyName.get('/alldeletedsupplynames',async(req,res)=>{
    let supplyNames = await supplyNameModel.findAll({raw:true , where:{isDeleted:"1"}});
    if(supplyNames[0]){
        res.json({supplyNames,status:"success"});
    }   
    else{
        res.json({message:"There is no deleted supply names",status:"failed"})
    }
})
supplyName.get('/supplytypename/:id',async(req,res)=>{
    let supplyTypeId = req.params.id;
    let supplyType = await supplyTypeModel.findOne({raw:true , where:{supplyTypeId , isDeleted:"0"}});
    supplyTypeNames = []
    if(supplyType){
        let supplyNames = await supplyNameModel.findAll({raw:true , where:{supplyType_id:supplyType.supplyTypeId , isDeleted:"0"}});
        if(supplyNames[0]){
            for (let i = 0; i < supplyNames.length; i++) {
                supplyNames[i].supplyType = supplyType.type;
                 supplyTypeNames.push(supplyNames[i])  ;             
            }
            if(supplyTypeNames[0]){
                res.json({supplyTypeNames,status:"success"});
            }
            else{
                res.json({message:"There is no supplies in this supplyType",status:"failed"})
            }
        }
        else{
            res.json({message:"There is no supplies in this supplyType",status:"failed"})
        }
    }
    else{
        res.json({message:"invalid supplyType Id",status:"failed"})
    }
})/*
supplyName.get('/yearsupplynames/:id',async(req,res)=>{
    let releaseYearId = req.params.id;
    let year = await releaseYearsModel.findOne({raw:true,where:{releaseYearId , isDeleted:"0"}});
    let yearSuppliesNames = []
    if(year){
        let supplyTypes = await supplyTypeModel.findAll({raw:true , where:{isDeleted:"0", releaseYear_id:year.releaseYearId}});
        if(supplyTypes[0]){
            for (let i = 0; i < supplyTypes.length; i++) {
                let supplyNames = await supplyNameModel.findAll({raw:true , where:{supplyType_id:supplyTypes[i].supplyTypeId , isDeleted:"0"}});
                if(supplyNames[0]){
                    for (let j = 0; j < supplyNames.length; j++) {
                        supplyNames[j].supplyType = supplyTypes[i].type;
                        supplyNames[j].year = year.year;
                        yearSuppliesNames.push(supplyNames[j])  ;             
                    }
                }
            }
            if(yearSuppliesNames[0]){
                res.json({yearSuppliesNames});
            }
            else{
                res.json({message:"There is no supplies in this year"})
            }
    }
    else{
        res.json({message:"there is no supplies in this year"})
    }
    }
    else{
        res.json({message:"invalid year id"})
    }
})
supplyName.get('/modelsupplynames/:id',async(req,res)=>{
    let carModelId = req.params.id
    let carModel = await carModelsModel.findOne({raw:true , where:{isDeleted:"0",carModelId}});
    modelSupplyNames=[];
        if(carModel){
        let releaseYears = await releaseYearsModel.findAll({raw:true , where:{isDeleted:"0",carModel_id :carModel.carModelId}});
        if(releaseYears[0]){
            for (let i = 0; i < releaseYears.length; i++) {
                let supplyTypes =  await supplyTypeModel.findAll({raw:true , where:{isDeleted:"0",releaseYear_id:releaseYears[i].releaseYearId}});
                if(supplyTypes[0]){
                    for (let j = 0; j < supplyTypes.length; j++) {
                        let supplyNames = await supplyNameModel.findAll({raw:true , where:{supplyType_id:supplyTypes[j].supplyTypeId , isDeleted:"0"}});
                if(supplyNames[0]){
                    for (let o = 0; o < supplyNames.length; o++) {
                        supplyNames[o].supplyType = supplyTypes[j].type;
                        supplyNames[o].year = releaseYears[i].year;
                        supplyNames[o].carModel = carModel.model
                        modelSupplyNames.push(supplyNames[o])  ;             
                    }
                }
                    }
                }                
            }
            if(modelSupplyNames[0]){
                res.json({modelSupplyNames});
            }
            else{
                res.json({message:"There is no supplies for this models"})
            }
        }
        else{
            res.json({message:"there is no release years and supplyTypes for this model"})
        }
    }
    else{
        res.json({message:"invalid car model id"})
    }
})
supplyName.get('/brandsupplynames/:id',async(req,res)=>{
    let carBrandId = req.params.id;
    let brandSupplyNames = []
    let carBrand = await carBrandsModel.findOne({raw:true , where:{isDeleted:"0",carBrandId}});
    if(carBrand){
        let carModels = await carModelsModel.findAll({raw:true , where:{isDeleted:"0",carBrand_id :carBrand.carBrandId}});
        if(carModels[0]){
            for (let i = 0; i < carModels.length; i++) {
                let releaseYears = await releaseYearsModel.findAll({raw:true , where:{isDeleted:"0",carModel_id :carModels[i].carModelId}});
                if(releaseYears[0]){
                    for (let j = 0; j < releaseYears.length; j++) {
                        let supplyTypes =  await supplyTypeModel.findAll({raw:true , where:{isDeleted:"0",releaseYear_id:releaseYears[j].releaseYearId}});
                        if(supplyTypes[0]){
                            for (let o = 0; o < supplyTypes.length; o++) {
                                let supplyNames = await supplyNameModel.findAll({raw:true , where:{supplyType_id:supplyTypes[o].supplyTypeId , isDeleted:"0"}});
                        if(supplyNames[0]){
                            for (let y = 0;  y< supplyNames.length; y++) {
                                supplyNames[y].supplyType = supplyTypes[o].type;
                                supplyNames[y].year = releaseYears[j].year;
                                supplyNames[y].carModel = carModels[i].model;
                                supplyNames[y].carBrand = carBrand.brand
                                brandSupplyNames.push(supplyNames[y])  ;             
                            }
                        }
                            }
                        }                
                    }
                   
                }
                else{
                    res.json({message:"there is no release years and supplyTypes for this model"})
                }
            }
            if(brandSupplyNames[0]){
                res.json({brandSupplyNames})
            }
            else{
                res.json({message:"there is no supplies in this brand"})
            }

        }
        else{
            res.json({message:"there is no models for this brand"})
        }
    }  
    else{
        res.json({message:"invalid carBrand Id"})
    }
})
supplyName.get('/countrysupplynames/:id',async(req,res)=>{
    let manufacturerCountryId= req.params.id;
    let countrySupplyNames =[]
    let manufacturerCountery= await manufacturerCountriesModel.findOne({raw:true ,where:{isDeleted:"0",manufacturerCountryId}});
    if(manufacturerCountery){
        let carBrands = await carBrandsModel.findAll({raw:true , where:{isDeleted:"0",manuFacturerCounter_id:manufacturerCountryId}})
        if(carBrands[0]){
            for (let i = 0; i < carBrands.length; i++) {
                let carModels = await carModelsModel.findAll({raw:true , where:{isDeleted:"0",carBrand_id :carBrands[i].carBrandId}});
                if(carModels[0]){
                    for (let j = 0; j < carModels.length; j++) {
                        let releaseYears = await releaseYearsModel.findAll({raw:true , where:{isDeleted:"0",carModel_id :carModels[j].carModelId}});
                        if(releaseYears[0]){
                            for (let o = 0; o < releaseYears.length; o++) {
                                let supplyTypes =  await supplyTypeModel.findAll({raw:true , where:{isDeleted:"0",releaseYear_id:releaseYears[o].releaseYearId}});
                                if(supplyTypes[0]){
                                    for (let y = 0; y < supplyTypes.length; y++) {
                                        let supplyNames = await supplyNameModel.findAll({raw:true , where:{supplyType_id:supplyTypes[y].supplyTypeId , isDeleted:"0"}});
                                if(supplyNames[0]){
                                    for (let p = 0;  p< supplyNames.length; p++) {
                                        supplyNames[p].supplyType = supplyTypes[y].type;
                                        supplyNames[p].year = releaseYears[o].year;
                                        supplyNames[p].carModel = carModels[j].model;
                                        supplyNames[p].carBrand = carBrands[i].brand
                                        supplyNames[p].country = manufacturerCountery.country
                                        countrySupplyNames.push(supplyNames[p])  ;             
                                    }
                                }
                                    }
                                }                
                            }
                           
                        }
                        else{
                            res.json({message:"there is no release years and supplyTypes for this model"})
                        }
                    }
                    if(countrySupplyNames[0]){
                        res.json({countrySupplyNames})
                    }
                    else{
                        res.json({message:"there is no supplies in this country"})
                    }
        
                }
            }
        }
        else{
            res.json({message:"there is no brand in this country"})
        }
    }
    else{
        res.json({message:"invalid country id"})
    }
})*/
supplyName.post('/addsupplyname/:id',async(req,res)=>{
    const {token , supply} = req.body
    let supplyTypeId=req.params.id
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
                let supplyType= await supplyTypeModel.findOne({raw:true , where:{supplyTypeId,isDeleted:"0"}});
                if(supplyType){
                    let supplyName = await supplyNameModel.findOne({raw:true , where:{isDeleted:"0",supply}});
                    // supplyName.supplyType = supplyType
                    if(!supplyName){
                        supplyName = await supplyNameModel.create({supply,supplyType_id:supplyType.supplyTypeId});
                        res.json({message:"تمت اضافه اسم القطعة بنجاح", supplyName,status:"success"});
                    }
                    else{
                        res.json({message:"تم اضافته من قبل" , status:"failed"})
                    }

                }
                else{
                    res.json({message:"خطأ فى الرقم التعريفي لنوع القطعة",status:"failed"});
                }
        }    
    })
})
supplyName.patch('/deletesupplyname/:id',async(req,res)=>{
    let supplyNameId = req.params.id;
    const {token } = req.body
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let supplyName = await supplyNameModel.findOne({raw:true ,  where:{ [op.and]:[
                {supplyNameId},{isDeleted : '0'}
                ]}});
              if(supplyName){
                supplyNameModel.update({isDeleted:'1'},{where:{ [op.and]:[
                    {supplyNameId},{isDeleted : '0'}
                    ]}})
                    res.json({message:"supply Name deleted successfully",status:"success"})
              }
              else{
                res.json({message:" invalid supplyName id",status:"failed"})
              }
        }    
    })
})
supplyName.patch('/undeletesupplyname/:id',async(req,res)=>{
    let supplyNameId = req.params.id;
    const {token } = req.body
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let supplyName = await supplyNameModel.findOne({raw:true ,  where:{ [op.and]:[
                {supplyNameId},{isDeleted : '1'}
                ]}});
              if(supplyName){
                supplyNameModel.update({isDeleted:'0'},{where:{ [op.and]:[
                    {supplyNameId},{isDeleted : '1'}
                    ]}})
                    res.json({message:"supply Name retrieved successfully",status:"success"})
              }
              else{
                res.json({message:" invalid supplyName id",status:"failed"})
              }
        }    
    })
})
supplyName.delete("/permenantdeletesupplyName/:id",async(req,res)=>{
    const { token } = req.body;
    let supplyNameId = req.params.id;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let supplyName = await supplyNameModel.findOne({raw:true ,  where:{supplyNameId}});
              if(supplyName){
                supplyNameModel.destroy({where:{supplyNameId}})
                    res.json({message:"supplyName permenantly deleted successfully",status:"success"})
              }
              else{
                res.json({message:" invalid supplyName id",status:"failed"})
              }
            }    
        })
})

module.exports=supplyName