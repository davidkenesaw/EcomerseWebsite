//require statements
const path = require('path')
require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
})
const express = require("express");

const upload = require("express-fileupload")
const cookieParser = require('cookie-parser');
const { seshOption } = require('../Config/db.config')
const {SignUp, Login, Authenticate, checknotLoggedIn, checkLoggedIn} = require('./ServerProcessing/LoginRegister')
const {addProduct,displayProducts} = require('./ServerProcessing/ProductFunct')
const {sendEmail} = require('./Email/email')
const {dbConn} = require('../Config/db.config');

//configre express app
const app = express();
app.set('view engine', 'ejs');//use ejs
app.use(express.urlencoded({ extended: true }));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))//add bootsrap css
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))//add bootsrap javascript
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))//add bootsrap jquery
app.use(cookieParser(process.env.SECRETE));//change this and make it secrete
app.set('views', path.join(__dirname, '../Client/views'));//show express the views directory
app.use(express.static(path.join(__dirname, '../Client')));//show express the Client directory
app.use(express.static(path.join(__dirname, '../Pictures')));
app.use(seshOption)//configuration for express session
app.use(upload())

//get requests 
app.get('/', checkLoggedIn,function(req,res){
    res.render("Home");
});
app.get('/HomeLoggedInPage', function(req,res){
    const name = req.session.FirstName
    res.render("HomeLoggedIn",{name});
});
app.get('/StorePage', function(req,res){
    res.render("Store");
});
app.get('/CartPage', function(req,res){
    res.render("Cart");
});
app.get('/LoginPage',checkLoggedIn, function(req,res){
    const error = ""
    res.render("Login",{error});
});
app.get('/SignUpPage', function(req,res){
    const error = ""
    res.render("SignUp",{error});
});
app.get('/TwoStepAuthPage', function(req,res){
    const code = Math.floor(Math.random() * 1000) + 999;
    req.session.Code = code;
    sendEmail(req.session.Email, code)
    
    const error = ""
    res.render("TwoStepAuth",{error});
});
app.get("/SignOut",checknotLoggedIn,function(req,res){
    req.session.UserName = null;
    req.session.FirstName = null;
    req.session.Lastname = null;
    req.session.Email = null;
    req.session.loggedIn = null;
    req.session.Admin = null;
    req.session.Code = null;
    res.render("Home")
})

//post requests
app.post("/SignUp",SignUp);
app.post("/Login",Login);
app.post("/Authenticate",Authenticate);






//test proj
app.get("/testFormPage",function(req,res){
    const error = ""
    res.render("testForm",{error})
})
app.post('/addProduct', addProduct);

app.get("/displayPage", function (req, res){
    dbConn.query("SELECT * FROM Products",function(err,rows){
        if(err){
            //if an error occures
            res.redirect("/testFormPage")
        }
        else{
            const newListItems = rows;
            res.render('display',{newListItems});
        }

    });
})



app.listen(process.env.PORT || 3000, function () {//host site
    console.log("Port: 3000");
    
});