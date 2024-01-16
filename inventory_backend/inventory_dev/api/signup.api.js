const signup = require('express').Router();
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
const db = require('../models/sequelize.model');
const moment = require('moment');
const userModel = require('../models/user.model');
const {check , validationResult} = require('express-validator');
const Sequelize = require('sequelize');
const op=Sequelize.Op

signup.post('/createuser' ,
check('phone').matches(/^(01)[0512][0-9]{8}$/)
,async(req,res)=>{
    const {fullName , userName , password , phone ,type ,token ,email}= req.body;
    jwt.verify(token , "admin", async (err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            const errors = validationResult(req);
            if(errors.isEmpty()){
                let user = await userModel.findOne({raw:true,where:{userName}});
                if(user===null){
                    user = await userModel.findOne({raw:true,where:{phone}});
                    if(user===null){
                        bcrypt.hash(password,7,async(err,hash)=>{
                            let joinDate = moment().format('YYYY-MM-DD HH:mm:ss');
                            await userModel.create({fullName , userName , password:hash , phone,type,  joinDate,email})
                            user= await userModel.findOne({raw:true , where:{userName}});
                            res.json({message:`user ${userName} Created`, user,status:"success"});
                        })
                    }
                    else{
                        res.json({message: "this phone was taken by another acc",status:"failed"})

                    }
                }
                else{
                    res.json({message: "this userName was taken by another acc",status:"failed"})
                }
            }
            else{
                let validationsErrors=[];
                for (let i = 0; i < errors.array().length; i++) {
                    console.log(errors.array()[i].param);
                    validationsErrors.push({field:errors.array()[i].param , status:errors.array()[i].msg})                    
                }
                res.json({errros : errors.array() , validationsErrors,status:"failed"})
            }
        }
    })
})
signup.get('/allusers',async(req,res)=>{
    let  allUsers = await userModel.findAll({raw:true , where:{isDeleted:'0'}});
    if(allUsers[0]){
        res.json({allUsers,status:"success"})
    }
    else{
        res.json({message:"there is no registered users",status:"failed"})
    }
})
signup.get('/user/:id',async(req,res)=>{
    let userId = req.params.id;
    let user = await userModel.findOne({raw:true , where:{userId , isDeleted:"0"}});
    if(user){
        res.json({user,status:"success"})
    }
    else{
        res.json({message:"invalid user id",status:"failed"})
    }
})
signup.get('/alldeletedusers',async(req,res)=>{
    let  allDeletedUsers = await userModel.findAll({raw:true , where:{isDeleted:'1'}});
    if(allDeletedUsers[0]){
        res.json({allDeletedUsers,status:"success"})
    }
    else{
        res.json({message:"there is no deleted users",status:"failed"})
    }
})

signup.get('/alladmins',async(req,res)=>{
    let  allAdmins = await userModel.findAll({raw:true , where:{ [op.and]:[
        {type:"admin"},{isDeleted : '0'}
        ]}});
    if(allAdmins[0]){
        res.json({allAdmins,status:"success"})
    }
    else{
        res.json({message:"there is no registered admins",status:"failed"})
    }
})
signup.get('/alldeletedadmins',async(req,res)=>{
    let  allDeletedAdmins = await userModel.findAll({raw:true , where:{ [op.and]:[
        {type:"admin"},{isDeleted : '1'}
        ]}});
    if(allDeletedAdmins[0]){
        res.json({allDeletedAdmins,status:"success"})
    }
    else{
        res.json({message:"there is no deleted admins",status:"failed"})
    }
})

signup.get('/allcashiers',async(req,res)=>{
    let  allClients = await userModel.findAll({raw:true , where:{ [op.and]:[
        {type:"cashier"},{isDeleted : '0'}
        ]}});
    if(allClients[0]){
        res.json({allClients,status:"success"})
    }
    else{
        res.json({message:"there is no registered cashiers",status:"failed"})
    }
})
signup.get('/alldeletedcashiers',async(req,res)=>{
    let  allDeletedClients = await userModel.findAll({raw:true , where:{ [op.and]:[
        {type:"cashiers"},{isDeleted : '1'}
        ]}});
    if(allDeletedClients[0]){
        res.json({allDeletedClients,status:"success"})
    }
    else{
        res.json({message:"there is no registered cashiers",status:"failed"})
    }
})
signup.patch('/deleteuser/:id',async(req,res)=>{
    let userId = req.params.id;
    const{token} = req.body
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let user = await userModel.findOne({raw:true , where:{ [op.and]:[
                {userId},{isDeleted : '0'}
                ]}})
            if(user){
                await userModel.update({isDeleted:'1'},{where:{ [op.and]:[
                    {userId},{isDeleted : '0'}
                    ]}})
                res.json({message:"user deleted succssefully",status:"success"})
            }
            else{
                res.json({message:"invalid user Id",status:"failed"})
            }
        }    
    })
    
})
signup.delete('/permenantedeleteuser/:id',async(req,res)=>{
    let userId = req.params.id;
    const{token} = req.body
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
            let user = await userModel.findOne({where:{userId}});
            if(user){
                await userModel.destroy({where:{userId}})
                res.json({message:"user permenantly deleted succssefully",status:"success"})
            }
            else{
                res.json({message:"invalid user Id",status:"failed"})
            }
        }    
    })
    
})

signup.patch('/undeleteuser/:id',async(req,res)=>{
    let userId = req.params.id;
    const {token} = req.body
    jwt.verify(token , 'admin',async(err,decodded)=>{
        if(err){
            res.json({message:"error in token",status:"failed"})
        }
        else{
       
            let user = await userModel.findOne({raw:true , where:{ [op.and]:[
                {userId},{isDeleted : '1'}
                ]}})
            if(user){
                await userModel.update({isDeleted:'0'},{where:{ [op.and]:[
                    {userId},{isDeleted : '1'}
                    ]}})
                res.json({message:"user retrieved succsefully",status:"success"})
            }
            else{
                res.json({message:"invalid user Id",status:"failed"})
            }
        }
    })
})
module.exports=signup