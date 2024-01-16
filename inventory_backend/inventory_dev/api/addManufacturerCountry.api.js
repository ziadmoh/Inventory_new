const addCountry = require('express').Router();
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

addCountry.get("/allcountries",async(req,res)=>{
    let countries = await manufacturerCountriesModel.findAll({raw:true , where:{isDeleted:"0"}});
    if(countries[0]){
        res.json({countries,status:"success"});
    }
    else{
        res.json({message:" there is no countries",status:"failed"})
    }
})
addCountry.get('/country/:id',async(req,res)=>{
    let manufacturerCountryId=req.params.id;
    let manufacturerCountry=await manufacturerCountriesModel.findOne({raw:true,   where:{ [op.and]:[
        {manufacturerCountryId},{isDeleted : '0'}
        ]}})
    if(manufacturerCountry){
        res.json({manufacturerCountry,status:"success"})
    }
    else{
        res.json({message:"invalid Country ID",status:"failed"})
    }
})
addCountry.post('/addcountry',async(req,res)=>{
    const { token  , country }=req.body;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let manufacturerCountry = await manufacturerCountriesModel.findOne({raw:true , where:{country,isDeleted:"0"}});
            if(manufacturerCountry){
                res.json({message:"هذه البلد مدخلة من قبل",status:"failed"})
            }
            else{
                await manufacturerCountriesModel.create({country});
                manufacturerCountry = await manufacturerCountriesModel.findOne({raw:true, where:{country}})
                res.json({message:"تمت الاضافة بنجاح" , manufacturerCountry,status:"success"});
            }
        }    
    })
})
addCountry.put('/updatecountry',async(req,res)=>{
    const { token  , id , country }=req.body;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let manufacturerCountry = await manufacturerCountriesModel.findOne({raw:true , where:{manufacturerCountryId : id,isDeleted:"0"}});
            if(!manufacturerCountry){
                res.json({message:"هذه البلد غير موجودة ",status:"failed"})
            }
            else{
                await manufacturerCountriesModel.update(
                    {country},
                    {where: {
                        manufacturerCountryId : id,
                    }}
                );
                manufacturerCountry = await manufacturerCountriesModel.findOne({raw:true, where:{country}})
                res.json({message:"تم التعديل بنجاح" , manufacturerCountry,status:"success"});
            }
        }    
    })
})
addCountry.patch("/deletecountry/:id",async(req,res)=>{
    const {token} = req.body;
    let manufacturerCountryId = req.params.id;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
          let manufacturerCountry = await manufacturerCountriesModel.findOne({raw:true ,  where:{ [op.and]:[
            {manufacturerCountryId},{isDeleted : '0'}
            ]}});
          if(manufacturerCountry){
            manufacturerCountriesModel.update({isDeleted:'1'},{where:{ [op.and]:[
                {manufacturerCountryId},{isDeleted : '0'}
                ]}})
                res.json({message:"manufacturer country deleted successfully",status:"success"})
          }
          else{
            res.json({message:" invalid country id",status:"failed"})
          }
        }    
    })
})
addCountry.get("/alldeletedcountries",async(req,res)=>{
    let  allDeletedCountries = await manufacturerCountriesModel.findAll({raw:true , where:{isDeleted:'1'}});
    if(allDeletedCountries[0]){
        res.json({allDeletedCountries})
    }
    else{
        res.json({message:"there is no deleted countries",status:"failed"})
    }
})
addCountry.patch("/undeletecountry/:id",async(req,res)=>{
    const {token} = req.body;
    let manufacturerCountryId = req.params.id;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
          let manufacturerCountery = await manufacturerCountriesModel.findOne({raw:true ,  where:{ [op.and]:[
            {manufacturerCountryId},{isDeleted : '1'}
            ]}});
          if(manufacturerCountery){
            manufacturerCountriesModel.update({isDeleted:'0'},{where:{ [op.and]:[
                {manufacturerCountryId},{isDeleted : '1'}
                ]}})
                res.json({message:"manufacturer country retrieved successfully"})
          }
          else{
            res.json({message:" invalid country id",status:"failed"})
          }
        }    
    })
})
addCountry.delete('/permenantdeletecountry/:id',async(req,res)=>{
    const {token} = req.body
    let manufacturerCountryId = req.params.id
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let manufacturerCountery = await manufacturerCountriesModel.findOne({raw:true , where:{manufacturerCountryId}});
            if(manufacturerCountery){
                let carBrands = await carBrandsModel.findAll({raw:true, where:{manuFacturerCounter_id:manufacturerCountery.manufacturerCountryId}})
                if(carBrands[0]){
                    for (let i = 0; i < carBrands.length; i++) {
                        let carModels = await carModelsModel.findAll({raw:true,where:{carBrand_id:carBrands[i].carBrandId}});
                        if(carModels[0]){
                            for (let j = 0; j < carModels.length; j++) {
                                let releaseYears = await releaseYearsModel.findAll({raw:true, where:{ carModel_id : carModels[j].carModelId}});
                                if(releaseYears[0]){
                                    for (let o = 0; o < releaseYears.length; o++) {
                                        let supplyTypes = await supplyTypeModel.findAll({raw:true , where:{releaseYear_id:releaseYears[o].releaseYearId}}) ;
                                        if(supplyTypes[0]){
                                            for (let y = 0; y < supplyTypes.length; y++) {
                                                let supplyNames= await supplyNameModel.findAll({raw:true , where:{supplyType_id : supplyTypes[y].supplyTypeId}});                        
                                                if(supplyNames[0]){
                                                    for (let l = 0; l < supplyNames.length; l++) {
                                                        await supplyProductModel.destroy({where:{supplyName_id:supplyNames[l].supplyNameId}});                                
                                                    }
                                                    await supplyNameModel.destroy({where:{supplyType_id:supplyTypes[y].supplyTypeId}});
                                                }
                                            }
                                            await supplyTypeModel.destroy({where:{releaseYear_id:releaseYears[o].releaseYearId}});
                                        }
                                        await releaseYearsModel.destroy({where:{carModel_id:carModels[j].carModelId}})
                                    }
                                }
                                await carModelsModel.destroy ({where:{carBrand_id:carBrands[i].carBrandId}})                           
                            }
                        }                        
                    }
                    await carBrandsModel.destroy({where:{manuFacturerCounter_id:manufacturerCountery.manufacturerCountryId}});
                }
                await manufacturerCountriesModel.destroy({where:{manufacturerCountryId}});
                res.json({message:"Manufacturer country permenantly deleted successfully" ,status:"success" });
            }
            else{
                res.json({message:"this country inserted before",status:"failed"})
            }
        }    
    })
})
module.exports=addCountry