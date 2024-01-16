const carbrands = require('express').Router();
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
const db = require('../models/sequelize.model');
const moment = require('moment');
const carbrandsModel = require('../models/carBrands.model');
const {check , validationResult} = require('express-validator');
const Sequelize = require('sequelize');
const e = require('express');
const manufacturercountriesModel = require('../models/manufacturerCounter.model');
const carModelsModel = require('../models/carModels.model');
const supplyTypeModel = require('../models/supplyType.model')
const supplyNameModel = require("../models/supplyName.model");
const supplyProductModel = require('../models/supplyProduct.model');
const releaseYearsModel = require('../models/releaseYear.model');
const op=Sequelize.Op
carbrands.get("/allbrands",async(req,res)=>{
    let allbrands = await carbrandsModel.findAll({raw:true , where:{isDeleted:"0"}});
    if(allbrands[0]){
        for (let i = 0; i < allbrands.length; i++) {
            let country = await manufacturercountriesModel.findOne({raw:true,where:{manufacturerCountryId:allbrands[i].manuFacturerCounter_id,isDeleted:"0"}});
            allbrands[i].country=country;                
        }
        res.json({allbrands,status:"success"})
    }
    else{
        res.json({message:"there is no brands",status:"failed"})
    }
})
carbrands.get('/brand/:brandid',async(req,res)=>{
    let carBrandId=req.params.brandid;
    let brand = await carbrandsModel.findOne({raw:true , where:{carBrandId,isDeleted:"0"}});
    if(brand)
    {
        res.json({brand,status:"success"})
    }
    else{
        res.json({message:"invalid brand ID",status:"failed"})
    }
})
carbrands.get('/countrybrands/:id',async(req,res)=>{
    let manufacturerCountryId = req.params.id;
    let manufacturerCountery=await manufacturercountriesModel.findOne({raw:true,where:{manufacturerCountryId,isDeleted:"0"}});
    if(manufacturerCountery){
        let brands =await carbrandsModel.findAll({raw:true, where:{manuFacturerCounter_id:manufacturerCountryId,isDeleted:"0"}});
        if(brands[0]){
            for (let i = 0; i < brands.length; i++) {
                brands[i].manufacturerCountery=  manufacturerCountery.country;              
            }
            res.json({brands,status:"success"});
        }
        else{
            res.json({message:"there is no brands in this country",status:"failed"})
        }
    }
    else{
        res.json({message:"invalid manufacturer country id",status:"failed"})
    }
})
carbrands.get("/alldeletedbrands",async(req,res)=>{
    let deletedBrands = await carbrandsModel.findAll({raw:true , where:{isDeleted:"1"}});
    if(deletedBrands[0]){
        res.json({deletedBrands,status:"success"})
    }
    else{
        res.json({message:"there is no deleted brands",status:"failed"})
    }
})
carbrands.post('/addbrand/:countryid',async(req,res)=>{
    const { token , brand }=req.body;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let manufacturerCountryId = req.params.countryid;
            let country = await manufacturercountriesModel.findOne({raw:true , where:{manufacturerCountryId , isDeleted:"0"}});
            if(country){
                let carBrand = await carbrandsModel.findOne({raw:true , where:{brand,isDeleted:"0"}});
                if(carBrand){
                    res.json({message:"هذا النوع مدخل من قبل",status:"failed"})
                }
                else{
                    await carbrandsModel.create({brand , manuFacturerCounter_id:manufacturerCountryId});
                    carBrand = await carbrandsModel.findOne({raw:true , where:{brand }});
                    res.json({message:"brand added successfully",carBrand,status:"success"});
                }
            }
            else{
                res.json({message:"Invalid manufacturer country id",status:"failed"})
            }
        }
    })
   
})
carbrands.patch('/deletebrand/:brandid',async(req,res)=>{
    const { token } = req.body;
    let carBrandId = req.params.brandid;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let carBrand = await carbrandsModel.findOne({raw:true ,  where:{ [op.and]:[
                {carBrandId},{isDeleted : '0'}
                ]}});
              if(carBrand){
                carbrandsModel.update({isDeleted:'1'},{where:{ [op.and]:[
                    {carBrandId},{isDeleted : '0'}
                    ]}})
                    res.json({message:"car brand deleted successfully",status:"success"})
              }
              else{
                res.json({message:" invalid car brand id",status:"failed"})
              }
            }    
        })
    })
carbrands.delete('/permenantdeletebrand/:brandid',async(req,res)=>{
        const { token } = req.body;
        let carBrandId = req.params.brandid;
        jwt.verify(token , 'admin',async(err,decodded)=>{
            if(err){
                res.json({message:"error in token",status:"failed"})
            }
            else{
                let carBrand = await carbrandsModel.findOne({raw:true ,  where:{carBrandId}});
                  if(carBrand){
                    let carModels = await carModelsModel.findAll({raw:true , where:{carBrand_id : carBrand.carBrandId}});
                    if(carModels[0]){
                        for (let i = 0; i < carModels.length; i++) {
                            let releaseYears = await releaseYearsModel.findAll({raw:true, where:{ carModel_id : carModels[i].carModelId}});
                            if(releaseYears[0]){
                                for (let j = 0; j < releaseYears.length; j++) {
                                    let supplyTypes = await supplyTypeModel.findAll({raw:true , where:{releaseYear_id:releaseYears[j].releaseYearId}}) ;
                                    if(supplyTypes[0]){
                                        for (let o = 0; o < supplyTypes.length; o++) {
                                            let supplyNames= await supplyNameModel.findAll({raw:true , where:{supplyType_id : supplyTypes[o].supplyTypeId}});                        
                                            if(supplyNames[0]){
                                                for (let y = 0; y < supplyNames.length; y++) {
                                                    await supplyProductModel.destroy({where:{supplyName_id:supplyNames[y].supplyNameId}});                                
                                                }
                                                await supplyNameModel.destroy({where:{supplyType_id:supplyTypes[o].supplyTypeId}});
                                            }
                                        }
                                        await supplyTypeModel.destroy({where:{releaseYear_id:releaseYears[j].releaseYearId}});
                                    }
                                    await releaseYearsModel.destroy({where:{carModel_id:carModels[i].carModelId}})
                                }
                            }
                            await carModelsModel.destroy ({where:{carBrand_id:carBrand.carBrandId}})                           
                        }
                    }
                    carbrandsModel.destroy({where:{carBrandId}})
                        res.json({message:"car brand  permenantly deleted successfully",status:"success"})
                  }
                  else{
                    res.json({message:" invalid car brand id",status:"failed"})
                  }
                }    
            })
    })
        
carbrands.patch('/undeletebrand/:brandid',async(req,res)=>{
    const { token } = req.body;
    let carBrandId = req.params.brandid;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let carBrand = await carbrandsModel.findOne({raw:true ,  where:{ [op.and]:[
                {carBrandId},{isDeleted : '1'}
                ]}});
             if(carBrand){
                    carbrandsModel.update({isDeleted:'0'},{where:{ [op.and]:[
                        {carBrandId},{isDeleted : '1'}
                        ]}})
                        res.json({message:"car brand retreieved successfully",status:"success"})
                  }
                  else{
                    res.json({message:" invalid car brand id",status:"failed"})
                  }
                }    
            })
        })
// carbrands.get('/countrybrands/:id',async(req,res)=>{
//     let manuFacturerCounter_id = req.params.id
//     let brands = await carbrandsModel.findAll({raw:true , where:{manuFacturerCounter_id},include:{model : manufacturercountriesModel}});
//     if(brands[0]){
//     res.json({x:brands[0].manufacturercountrie.country})
//     }
//     else{
//         res.json({message:"no"})
//     }
// })
// carbrands.get('/x/:id',async(req,res)=>{
//     let carBrand_id = req.params.id
//     let brands = await carModelsModel.findAll({raw:true , where:{carBrand_id},include:{model : carbrandsModel}});
//    // let countries=[]
//     console.log(brands);
//      let countries= await carbrandsModel.findAll({raw:true , where:{},include:{model : brands}});

//     if(brands[0]){
//     res.json({brands , countries})
//     }
//     else{
//         res.json({message:"no"})
//     }
// })
module.exports=carbrands
