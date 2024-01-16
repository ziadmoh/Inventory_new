const supplyType = require('express').Router();
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
const db = require('../models/sequelize.model');
const moment = require('moment');
const carmodelsmodel = require('../models/carModels.model');
const carBrandsModel = require("../models/carBrands.model");
const releaseYearsModel = require('../models/releaseYear.model');
const {check , validationResult} = require('express-validator');
const Sequelize = require('sequelize');
const e = require('express');
const manufacturercountriesModel = require('../models/manufacturerCounter.model');
const supplyTypeModel = require('../models/supplyType.model')
const supplyNameModel = require("../models/supplyName.model");
const supplyProductModel = require('../models/supplyProduct.model')
const op=Sequelize.Op

supplyType.get('/allsupplytypes',async(req,res)=>{
    let supplyTypes = await supplyTypeModel.findAll({raw:true , where:{isDeleted:"0"}});
    if(supplyTypes[0]){
        res.json({supplyTypes,status:"success"});
    }
    else{
        res.json({message:"there is no supplyTypes",status:"failed"})
    }
})
supplyType.get('/alldeletedsupplytypes',async(req,res)=>{
    let supplyTypes = await supplyTypeModel.findAll({raw:true , where:{isDeleted:"1"}});
    if(supplyTypes[0]){
        res.json({supplyTypes,status:"success"});
    }
    else{
        res.json({message:"there is no deleted supplyTypes",status:"failed"})
    }
})
supplyType.get('/supplyType/:id',async(req,res)=>{
    let supplyTypeId = req.params.id;
    let supplyType = await supplyTypeModel.findOne({raw:true , where:{isDeleted:"0",supplyTypeId}});
    if(supplyType){
        res.json({supplyType,status:"success"});
    }
    else{
        res.json({message:"invalid supply type Id",status:"failed"})
    }
})
/*supplyType.get('/yearsupplyTypes/:id',async(req,res)=>{
    let releaseYearId = req.params.id;
    let year = await releaseYearsModel.findOne({raw:true , where:{releaseYearId, isDeleted:"0"}});
    let yearSupplyTypes = [];
    if(year){
        let supplyTypes = await supplyTypeModel.findAll({raw:true , where:{isDeleted:"0", releaseYear_id:year.releaseYearId}});
        if(supplyTypes[0]){
            for (let i = 0; i < supplyTypes.length; i++) {
                supplyTypes[i].year = year.year      
                yearSupplyTypes.push(supplyTypes[i])          
            }
            res.json({yearSupplyTypes});
        }
        else{
            res.json({message:"there is no supply types for this year"})
        }
    }
    else{
        res.json({message:"invalid year id"})
    }
})
supplyType.get('/modelsupplytypes/:id',async(req,res)=>{
    let carModelId = req.params.id
    let carModel= await carmodelsmodel.findOne({raw:true , where:{isDeleted:"0",carModelId}});
    let modelYearsSupplyTypes=[]
    if(carModel){
        let releaseYears = await releaseYearsModel.findAll({raw:true , where:{isDeleted:"0",carModel_id :carModel.carModelId}});
        if(releaseYears[0]){
            for (let i = 0; i < releaseYears.length; i++) {
                let supplyTypes =  await supplyTypeModel.findAll({raw:true , where:{isDeleted:"0",releaseYear_id:releaseYears[i].releaseYearId}});
                if(supplyTypes[0]){
                    for (let j = 0; j < supplyTypes.length; j++) {
                        supplyTypes[j].year = releaseYears[i].year;
                        supplyTypes[j].model = carModel.model        
                        modelYearsSupplyTypes.push(supplyTypes[j]);                
                    }
                }                
            }
            if(modelYearsSupplyTypes[0]){
                res.json({modelYearsSupplyTypes});
            }
            else{
                res.json({message:"There is no supplytypes for this models"})
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
supplyType.get('/brandsupplytypes/:id',async(req,res)=>{
    let carBrandId = req.params.id;
    let carBrand = await carBrandsModel.findOne({raw:true , where:{isDeleted:"0",carBrandId}});
    let brandSupplyTypes=[]
    if(carBrand){
        let carModels = await carmodelsmodel.findAll({raw:true , where:{isDeleted:"0",carBrand_id:carBrand.carBrandId}});
        if(carModels[0]){
            for (let i = 0; i < carModels.length; i++) {
                let releaseYears=await releaseYearsModel.findAll({raw:true , where:{isDeleted:"0",carModel_id:carModels[i].carModelId}});
                if(releaseYears){
                    for (let j = 0; j < releaseYears.length; j++) {
                        let supplyTypes =await supplyTypeModel.findAll({raw:true , where:{isDeleted:"0",releaseYear_id:releaseYears[j].releaseYearId}});
                        if(supplyTypes[0]){
                            for (let y = 0; y < supplyTypes.length; y++) {
                                supplyTypes[y].year = releaseYears[j].year;
                                supplyTypes[y].model = carModels[i].model;
                                supplyTypes[y].brand = carBrand.brand;    
                                brandSupplyTypes.push(supplyTypes[y]);                        
                            }
                        }                        
                    }
                }
                
            }
            if(brandSupplyTypes[0]){
                res.json({brandSupplyTypes});
            }
            else{
                res.json({message:"there is no supply types"})
            }
        }
        else{
            res.json({message:"There is no supply types for this brand"})
        }
    }
    else{
        res.json({message:"invalid carBrand id"})
    }
})
supplyType.get('/countrysupplytypes/:id',async(req,res)=>{
    let manufacturerCountryId = req.params.id;
    let countrySupplyTypes=[]
    let manufacturerCountry = await manufacturercountriesModel.findOne({raw:true, where:{isDeleted:"0",manufacturerCountryId}});
    if (manufacturerCountry) {
        let carBrands = await carBrandsModel.findAll({raw:true ,where:{isDeleted:"0",manuFacturerCounter_id:manufacturerCountry.manufacturerCountryId}});
        if(carBrands[0]){
            for (let i = 0; i < carBrands.length; i++) {
                let carModels = await carmodelsmodel.findAll({raw:true , where:{isDeleted:"0",carBrand_id:carBrands[i].carBrandId}});
                if(carModels[0]){
                    for (let j = 0; j < carModels.length; j++) {
                        let releaseYears=await releaseYearsModel.findAll({raw:true , where:{isDeleted:"0",carModel_id:carModels[j].carModelId}});
                        if(releaseYears){
                            for (let o = 0; o < releaseYears.length; o++) {
                                let supplyTypes =await supplyTypeModel.findAll({raw:true , where:{isDeleted:"0",releaseYear_id:releaseYears[o].releaseYearId}});
                                if(supplyTypes[0]){
                                    for (let y = 0; y < supplyTypes.length; y++) {
                                        supplyTypes[y].year = releaseYears[o].year;
                                        supplyTypes[y].model = carModels[j].model;
                                        supplyTypes[y].brand = carBrands[i].brand;    
                                        countrySupplyTypes.push(supplyTypes[y]);                        
                                    }
                                }                        
                            }
                        }
                        
                    }
                }                
            }
            
        if(countrySupplyTypes[0]){
            res.json({countrySupplyTypes});
        }
        else{
            res.json({message:"there is no supplyTypes for this country"})
        }
        }
        else{
            res.json({message:"There is no brands and supply types for this country"})
        }
    }
    else{
        res.json({message:"invalid manufacturerCountry id"})
    }
})*/
supplyType.post('/addsupplytype',async(req,res)=>{
    const { token, type } =req.body
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
                let supplyType = await supplyTypeModel.findOne({raw:true ,where:{ isDeleted:"0",type :type}})
                if(!supplyType){
                    supplyType = await supplyTypeModel.create({type })
                    res.json({message:"تمت الاضافة بنجاح" , supplyType,status:"success"});
                }
                else{
                    res.json({message:"مدخلة من قبل",status:"failed"})
                }

        }
           
    })

})
supplyType.patch('/deletesupplytype/:id',async(req,res)=>{
    const { token } =req.body
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let supplyTypeId= req.params.id;
            let supplyType = await supplyTypeModel.findOne({raw:true , where:{supplyTypeId , isDeleted:"0"}});
            if(supplyType){
                supplyTypeModel.update({isDeleted:'1'},{where:{ [op.and]:[
                    {supplyTypeId},{isDeleted : '0'}
                    ]}})
                    res.json({message:"supplyType deleted successfully",status:"success"})
            }
            else{
                res.json({message:" invalid supplyType id",status:"failed"})
            }
        }
           
    })

})
supplyType.patch('/undeletesupplytype/:id',async(req,res)=>{
    const { token } =req.body
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let supplyTypeId= req.params.id;
            let supplyType = await supplyTypeModel.findOne({raw:true , where:{supplyTypeId , isDeleted:"1"}});
            if(supplyType){
                supplyTypeModel.update({isDeleted:'0'},{where:{ [op.and]:[
                    {supplyTypeId},{isDeleted : '1'}
                    ]}})
                    res.json({message:"supplyType retrieved successfully",status:"success"})
            }
            else{
                res.json({message:" invalid supplyType id",status:"failed"})
            }
        }
           
    })

})
supplyType.delete("/permenantdeletesupplyType/:id",async(req,res)=>{
    const { token } = req.body;
    let supplyTypeId = req.params.id;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let supplyType = await supplyTypeModel.findOne({raw:true ,  where:{supplyTypeId}});
            if(supplyType){
                supplyTypeModel.destroy({where:{supplyTypeId}})
                res.json({message:"supplyType permenantly deleted successfully",status:"success"})
              }
            else{
                res.json({message:" invalid supplyType id",status:"failed"})
            }
            }    
        })
})
module.exports = supplyType;