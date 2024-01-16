const express = require('express')
const app = express();
const cors = require('cors')
const port = 3000;
const path = require('path')
const db= require('./models/sequelize.model');
const signup = require('./api/signup.api')
const signin = require('./api/signin.api');
const manufacturerCountries = require('./api/addManufacturerCountry.api');
const carbrands = require('./api/carbrands.api');
const carModels = require('./api/carmodels.api')
const releaseYears = require('./api/releaseyears.api');
const supplyType = require("./api/supplyType.api");
const supplyName = require("./api/supplyNames.api");
const supplyProduct = require("./api/supplyProducts.api")
const selling = require('./api/selling.api');
const returnedItems = require('./api/returnedItems.api');
const storages = require('./api/storages.api');
const productStorages = require('./api/productStorages.api');
const reports = require('./api/reports.api');
app.use(express.static(path.join(__dirname,'public')));
app.use('/uploads',express.static(path.join(__dirname,'uploads')));
//app.use('/uploads',express.static(path.join(__dirname,'uploads')));
app.use(cors())
app.use(express.json());
app.use(signup);
app.use(signin);
app.use(manufacturerCountries);
app.use(carbrands);
app.use(carModels);
app.use(releaseYears);
app.use(supplyType);
app.use(supplyName);
app.use(supplyProduct);
app.use(selling);
app.use(storages);
app.use(productStorages);
app.use(returnedItems);
app.use(reports);
//connect the db
async function database (){
    await db.authenticate(()=>{
        console.log("conn");
    });
}

//calling the apis
//

//run the server
app.get('/',async (req,res)=>{
    //const user = await userModel.findOne({raw:true})
    //await serviceModel.create({serviceTitle,serviceContent})
    res.json({message:"hello"});
})
database();
app.listen(process.env.PORT || port,()=>{
    console.log('Bsm Allah');
})