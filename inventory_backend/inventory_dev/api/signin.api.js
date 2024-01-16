const signin = require('express').Router();
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
const db = require('../models/sequelize.model');
const Sequelize = require('sequelize');
const op=Sequelize.Op
const userModel = require('../models/user.model');
signin.post('/signin',async(req,res)=>{
    const {userName  , password} = req.body;
    let user = await userModel.findOne({ raw:true, where:{[op.or]:[{userName},{phone:userName}]}})
        if (user){
            console.log(password + " ____ " +user.password);
            const match =await  bcrypt.compare(password, user.password); 
            //console.log("match : " + match);
            if(match){
               // console.log('typeeeee ====='+user.type);
                if(user.type==='cashier'){
                let token = jwt.sign({role:"cashier",userName},"cashier");
                res.json({message:"success",userName:user.userName , phone:user.phone , token , userInfo:user});
                }
                else if (user.type === 'admin'){
                    let token = jwt.sign({role:"admin",userName},"admin");
                    res.json({message:"success",userName:user.userName , phone:user.phone , token , userInfo:user});
                    }
                }
            
            else{
                res.json({message:"incorrect password",status:"failed"})
            }
        }
        
    else{
        res.json({message:"userName or Phone incorrect",status:"failed"})
    }
})

module.exports=signin