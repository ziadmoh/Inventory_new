const storages = require('express').Router();
const jwt=require('jsonwebtoken')
const storagesModel = require('../models/storages.model');
const Sequelize = require('sequelize');
const e = require('express');

const op=Sequelize.Op

storages.get("/allStorages",async(req,res)=>{
    let storages = await storagesModel.findAll({raw:true , where:{isDeleted:"0"}});
    if(storages[0]){
        res.json({storages,status:"success"});
    }
    else{
        res.json({message:"لا توجد مخازن بعد",status:"failed"})
    }
    
   
})
storages.get('/storage/:id',async(req,res)=>{
    let storageId=req.params.id;
    let storage=await storagesModel.findOne({raw:true,   where:{ [op.and]:[
        {storageId},{isDeleted : '0'}
        ]}})
    if(storage){
        res.json({storage,status:"success"})
    }
    else{
        res.json({message:"الرقم التعريفي غير صحيح",status:"failed"})
    }
})
storages.post('/addStorage',async(req,res)=>{
    const { token  , storageName,type,address }=req.body;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"خطأ في رمز التأكيد",status:"failed"})
        }
        else{
            let storage = await storagesModel.findOne({raw:true , where:{isDeleted:"0",storageName}});
            if(storage){
                res.json({message:"يوجد مخزن بهذا الاسم بالفعل!",status:"failed"})
            }
            else{
                await storagesModel.create({storageName,type,address});
                storage = await storagesModel.findOne({raw:true, where:{storageName}})
                res.json({message:"تم اضافة المخزن بنجاح" , storage,status:"success"});
            }
        }    
    })
})
storages.patch("/deletestorage/:id",async(req,res)=>{
    const {token} = req.body;
    let storageId = req.params.id;
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"خطأ في رمز التأكيد",status:"failed"})
        }
        else{
          let storage = await storagesModel.findOne({raw:true ,  where:{ [op.and]:[
            {storageId},{isDeleted : '0'}
            ]}});
          if(storage){
            storagesModel.update({isDeleted:'1'},{where:{ [op.and]:[
                {storageId},{isDeleted : '0'}
                ]}})
                res.json({message:"تم مسح المخزن بنجاح",status:"success"})
          }
          else{
            res.json({message:"الرقم التعريفي غير صحيح",status:"failed"})
          }
        }    
    })
})

module.exports=storages