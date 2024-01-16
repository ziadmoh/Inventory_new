const carModels = require('express').Router();
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
const db = require('../models/sequelize.model');
const moment = require('moment');
const carmodelsmodel = require('../models/carModels.model');
const carBrandsModel = require("../models/carBrands.model")
const {check , validationResult} = require('express-validator');
const Sequelize = require('sequelize');
const e = require('express');
const manufacturercountriesModel = require('../models/manufacturerCounter.model');
const supplyTypeModel = require('../models/supplyType.model')
const supplyNameModel = require("../models/supplyName.model");
const supplyProductModel = require('../models/supplyProduct.model');
const releaseYearsModel = require('../models/releaseYear.model');
const op=Sequelize.Op
carModels.get('/allmodels',async(req,res)=>{
    let models=await carmodelsmodel.findAll({raw:true , where:{isDeleted:"0"}});
    
    if(models[0]){
        for (let i = 0; i < models.length; i++) {
            let brand = await carBrandsModel.findOne({raw:true,where:{carBrandId:models[i].carBrand_id,isDeleted:"0"}});
            models[i].brand=brand;                
        }
       // res.brand = brand
        res.json({models,status:"success"});
    }
    else{
        res.json({message:"thereis no models",status:"failed"})
    }
})
carModels.get('/alldeletedmodels',async(req,res)=>{
    let models=await carmodelsmodel.findAll({raw:true , where:{isDeleted:"1"}});
    if(models[0]){
        res.json({models,status:"success"});
    }
    else{
        res.json({message:"there is no deleted models",status:"failed"})
    }
})
carModels.get('/model/:id',async(req,res)=>{
    let carModelId = req.params.id;
    let model = await carmodelsmodel.findOne({raw:true , where:{carModelId}});
    if(model){
        res.json({model,status:"success"});
    }
    else{
        res.json({message:"invalid model id",status:"failed"})
    }
})
//get models for particular brand
carModels.get('/brandmodels/:id',async(req,res)=>{
    let carBrand_id = req.params.id;
    let brand = await carBrandsModel.findOne({raw:true,where:{carBrandId:carBrand_id,isDeleted:"0"}});
    if(brand){
        let models = await carmodelsmodel.findAll({raw:true , where:{carBrand_id:brand.carBrandId,isDeleted:"0"}})
        if(models[0]){
            for (let i = 0; i < models.length; i++) {
                models[i].brand=brand.brand;                
            }
            res.json({models,status:"success"})
        }
        else{
            res.json({message:"there is no models for this brand",status:"failed"})
        }
    }
    else{
        res.json({message:"invalid car brand id",status:"failed"})
    }
})
//get models in particular country
carModels.get('/countrymodels/:id',async(req,res)=>{
    let manuFacturerCounter_id = req.params.id;
    let manufacturerCountry = await manufacturercountriesModel.findOne({raw:true , where:{manufacturerCountryId:manuFacturerCounter_id,isDeleted:"0"}});
    let countryModels=[]
    if(manufacturerCountry){
        let carBrands = await carBrandsModel.findAll({raw:true , where:{manuFacturerCounter_id:manufacturerCountry.manufacturerCountryId,isDeleted:"0"}});
        if(carBrands[0]){
            for (let i = 0; i < carBrands.length; i++) {
                let carmodels = await carmodelsmodel.findAll({raw:true , where:{carBrand_id:carBrands[i].carBrandId,isDeleted:"0"}});
                if(carmodels[0]){
                    for (let j = 0; j < carmodels.length; j++) {
                        carmodels[j].brand = carBrands[i].brand;
                        carmodels[j].manufacturerCountry=manufacturerCountry.country;     
                        countryModels.push(carmodels[j])               
                    }
                }
            }
            if(countryModels[0]){
                res.json({countryModels,status:"success"})
            }
            else{
                res.json({message:"there is no models in this country",status:"failed"})
            }
            
        }
        else{
            res.json({message:"There is no brands and models in this country",status:"failed"})
        }
    }
    else{
        res.json({message:"invalid country id",status:"failed"})
    }
})
carModels.post('/addmodel/:id',async(req,res)=>{
    const { token , model }= req.body;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let carBrandId = req.params.id;
            let carBrand = await carBrandsModel.findOne({raw:true, where:{carBrandId , isDeleted:"0"}})
            if(carBrand){
                let carModel = await carmodelsmodel.findOne({raw:true , where:{model,isDeleted:"0"}});
                if(carModel){
                    res.json({message:"هذا الموديل مدخل من قبل",status:"failed"})
                }
                else{
                    await carmodelsmodel.create({model , carBrand_id:carBrand.carBrandId});
                    carModel=await carmodelsmodel.findOne({raw:true , where:{model,carBrand_id:carBrand.carBrandId}});
                    res.json({message:"success",carModel});
                }
            }
            else{
                res.json({message:"invlaid car brand id",status:"failed"})
            }
        }
    })
})
carModels.patch('/deletemodel/:id',async(req,res)=>{
    const { token } = req.body;
    let carModelId = req.params.id;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let carModel = await carmodelsmodel.findOne({raw:true ,  where:{ [op.and]:[
                {carModelId},{isDeleted : '0'}
                ]}});
              if(carModel){
                carmodelsmodel.update({isDeleted:'1'},{where:{ [op.and]:[
                    {carModelId},{isDeleted : '0'}
                    ]}})
                    res.json({message:"car model deleted successfully",status:"success"})
              }
              else{
                res.json({message:" invalid car model id",status:"failed"})
              }
            }    
        })
})
carModels.patch('/undeletemodel/:id',async(req,res)=>{
    const { token } = req.body;
    let carModelId = req.params.id;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let carModel = await carmodelsmodel.findOne({raw:true ,  where:{ [op.and]:[
                {carModelId},{isDeleted : '1'}
                ]}});
              if(carModel){
                carmodelsmodel.update({isDeleted:'0'},{where:{ [op.and]:[
                    {carModelId},{isDeleted : '1'}
                    ]}})
                    res.json({message:"car model retrieved successfully",status:"success"})
              }
              else{
                res.json({message:" invalid car model id",status:"failed"})
              }
            }    
        })
})
carModels.delete("/permenantdeletemodel/:id",async(req,res)=>{
    const { token } = req.body;
    let carModelId = req.params.id;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let carModel = await carmodelsmodel.findOne({raw:true ,  where:{carModelId}});
              if(carModel){
                let releaseYears = await releaseYearsModel.findAll({raw:true , where:{carModel_id:carModel.carModelId}});
                if(releaseYears[0]){
                    for (let i = 0; i < releaseYears.length; i++) {
                        let supplyTypes = await supplyTypeModel.findAll({raw:true , where:{releaseYear_id:releaseYears[i].releaseYearId}}) ;
                        if(supplyTypes[0]){
                            for (let j = 0; j < supplyTypes.length; j++) {
                                let supplyNames= await supplyNameModel.findAll({raw:true , where:{supplyType_id : supplyTypes[j].supplyTypeId}});                        
                                if(supplyNames[0]){
                                    for (let o = 0; o < supplyNames.length; o++) {
                                        await supplyProductModel.destroy({where:{supplyName_id:supplyNames[o].supplyNameId}});                                
                                    }
                                    await supplyNameModel.destroy({where:{supplyType_id:supplyTypes[j].supplyTypeId}});
                                }
                            }
                            await supplyTypeModel.destroy({where:{releaseYear_id:releaseYears[i].releaseYearId}});
                        }
                        await releaseYearsModel.destroy({where:{carModel_id:carModel.carModelId}})
                    }
                }
                carmodelsmodel.destroy({where:{carModelId}})
                    res.json({message:"car model permenantly deleted successfully",status:"success"})
              }
              else{
                res.json({message:" invalid car model id",status:"failed"})
              }
            }    
        })
})
// carModels.get('/brandModelsss/:id',async(req,res)=>{
//     let carBrand_id = req.params.id;
//     //SELECT carModelId , model , brand  FROM carmodels INNER JOIN carbrands ON carBrand_id=carBrandId WHERE carBrand_id=${carBrand_id}
//     //select * from ((carmodels JOIN carbrands on carBrand_id =carBrandId AND carBrand_id = ${carBrand_id}) join manufacturercountries on manuFacturerCounter_id = manufacturerCountryId AND carBrandId = ${carBrand_id})

//     let brandModels =await db.query(`SELECT * FROM carmodels INNER JOIN carbrands ON carmodels.carBrand_id=carbrands.carBrandId WHERE carmodels.carBrand_id=${carBrand_id}`)
//     //console.log(await db.query(`SELECT * FROM carmodels INNER JOIN carbrands ON carmodels.carBrand_id=carbrands.carBrandId WHERE carmodels.carBrand_id=${carBrand_id}`));
//     if(brandModels[0]){
//         res.json({brandModels});
//     }
//     else{
//         res.json({message:"no brands"})
//     }

// })
module.exports=carModels;