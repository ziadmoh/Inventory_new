const releaseYears = require('express').Router();
const jwt=require('jsonwebtoken')
const releaseYearsModel = require('../models/releaseYear.model')
const Sequelize = require('sequelize');
const e = require('express');
const op=Sequelize.Op
releaseYears.get('/allyears',async(req,res)=>{
    let years = await releaseYearsModel.findAll({raw:true , where:{isDeleted:"0"}});
    if(years[0]){
        res.json({years,status:"success"});
    }
    else{
        res.json({message:"there is no years",status:"failed"})
    }
})
releaseYears.get('/alldeletedyears',async(req,res)=>{
    let years = await releaseYearsModel.findAll({raw:true , where:{isDeleted:"1"}});
    if(years[0]){
        res.json({years,status:"success"});
    }
    else{
        res.json({message:"there is no deleted years",status:"success"})
    }
})
releaseYears.get('/year/:id',async(req,res)=>{
    let releaseYearId = req.params.id;
    let year = await releaseYearsModel.findOne({raw:true ,where:{releaseYearId}});
    if(year){
        res.json({year,status:"success"})
    }
    else{
        res.json({message:"invalid year id",status:"failed"})
    }
})
/*releaseYears.get('/modelyears/:id',async(req,res)=>{
    let carModelId=req.params.id;
    let carModel = await carmodelsmodel.findOne({raw:true ,where:{carModelId,isDeleted:"0"}});
    if(carModel){
        let years = await releaseYearsModel.findAll({raw:true , where:{carModel_id:carModel.carModelId,isDeleted:"0"}});
        if(years[0]){
            for (let i = 0; i < years.length; i++) {
                years[i].model = carModel.model;                
            }
            res.json({years,status:"success"});
        }
        else{
            res.json({message:"there is no years in this model"})
        }
    }
    else{
        res.json({message:"invalid model id"})
    }

})
releaseYears.get('/brandmodelsyears/:id',async(req,res)=>{
    let carBrandId = req.params.id;
    let  carBrand =  await carBrandsModel.findOne({raw:true, where:{carBrandId , isDeleted:"0"}});
    let brandModelYears = []
    if(carBrand){
        let carModels = await carmodelsmodel.findAll({raw:true , where :{carBrand_id:carBrand.carBrandId , isDeleted:"0"}});
        if(carModels[0]){
            for (let i = 0; i < carModels.length; i++) {
                let years = await releaseYearsModel.findAll({raw:true , where:{carModel_id:carModels[i].carModelId,isDeleted:"0"}});
                if(years[0]){
                    for (let j = 0; j < years.length; j++) {
                        years[j].model = carModels[i].model;
                        years[j].brand = carBrand.brand;
                        brandModelYears.push(years[j]);
                    }
                }                
            }
            if(brandModelYears[0]){
            res.json({brandModelYears})
            }
            else{
                res.json({message:"there is no years for this model"})
            }
        }
        else{
            res.json({message:"there is no models and years in this brand"})
        }
    }
    else{
        res.json({message:"invalid brand id"})
    }
})
releaseYears.get('/countrybrandsmodelsyears/:id',async(req,res)=>{
    let manufacturerCountryId = req.params.id;
    let manufacturerCountry= await manufacturercountriesModel.findOne({raw:true , where:{manufacturerCountryId , isDeleted:"0"}})
    let countryBrandsModelsYears = []
    if(manufacturerCountry){
        let carBrands = await carBrandsModel.findAll({raw:true , where:{manuFacturerCounter_id:manufacturerCountry.manufacturerCountryId,isDeleted:"0"}});
        if(carBrands[0]){
            for (let i = 0; i < carBrands.length; i++) {
                let carModels = await carmodelsmodel.findAll({raw:true , where:{carBrand_id:carBrands[i].carBrandId,isDeleted:"0"}});
                if(carModels[0]){
                    for (let j = 0; j < carModels.length; j++) {
                        let years = await releaseYearsModel.findAll({raw:true , where:{carModel_id:carModels[j].carModelId,isDeleted:"0"}});
                        if(years[0]){
                            for (let y = 0; y < years.length; y++) {
                                years[y].model = carModels[j].model;
                                years[y].brand = carBrands[i].brand;
                                years[y].manufaturerCountry = manufacturerCountry.country              
                                countryBrandsModelsYears.push(years[y])                  
                            }
                        }
                    }
                }
            }
            if(countryBrandsModelsYears[0]){
                res.json({countryBrandsModelsYears})
            }
            else{
                res.json({message:"there is no years",status:"failed"})
            }
        }
        else{
            res.json({message:" there is no brand and models and years fo this country"})
        }
    }
    
    else{
        res.json({message:"invalid country id"})
    }
})*/
releaseYears.post('/addyear',async(req,res)=>{
    const {token , year} = req.body;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
                let releaseYear = await releaseYearsModel.findOne({raw:true , where:{isDeleted:"0",year }});
                if(!releaseYear){
                    await releaseYearsModel.create({year });
                    releaseYear = await releaseYearsModel.findOne({raw:true , where:{year }});
                    res.json({message:"تمت الاضفة بنجاح" , releaseYear,status:"success"})
                }
                else{
                    res.json({message:"مدخلة من قبل",status:"failed"})
                }

        }
    })
})
releaseYears.patch("/deleteyear/:id",async(req,res)=>{
    const { token } = req.body;
    let releaseYearId = req.params.id;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let year = await releaseYearsModel.findOne({raw:true ,  where:{ [op.and]:[
                {releaseYearId},{isDeleted : '0'}
                ]}});
              if(year){
                releaseYearsModel.update({isDeleted:'1'},{where:{ [op.and]:[
                    {releaseYearId},{isDeleted : '0'}
                    ]}})
                    res.json({message:"release year deleted successfully",status:"success"})
              }
              else{
                res.json({message:" invalid release year id",status:"failed"})
              }
            }    
        })
})
releaseYears.patch("/undeleteyear/:id",async(req,res)=>{
    const { token } = req.body;
    let releaseYearId = req.params.id;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let year = await releaseYearsModel.findOne({raw:true ,  where:{ [op.and]:[
                {releaseYearId},{isDeleted : '1'}
                ]}});
              if(year){
                releaseYearsModel.update({isDeleted:'0'},{where:{ [op.and]:[
                    {releaseYearId},{isDeleted : '1'}
                    ]}})
                    res.json({message:"release year retrieved successfully",status:"success"})
              }
              else{
                res.json({message:" invalid release year id",status:"failed"})
              }
            }    
        })
})
releaseYears.delete("/permenantdeleteyear/:id",async(req,res)=>{
    const { token } = req.body;
    let releaseYearId = req.params.id;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let year = await releaseYearsModel.findOne({raw:true ,  where:{releaseYearId}});
              if(year){
                releaseYearsModel.destroy({where:{releaseYearId}})
                res.json({message:"release year permenantly deleted successfully",status:"success"})
              }
              else{
                res.json({message:" invalid release year id",status:"failed"})
              }
            }    
        })
})
module.exports=releaseYears;