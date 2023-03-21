//require statements
const path = require('path')
require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
})
const express = require("express");

const upload = require("express-fileupload")
const cookieParser = require('cookie-parser');
const { seshOption } = require('../Config/db.config')
const {SignUp, Login, Authenticate, ifLoggedHelper} = require('./ServerProcessing/LoginRegister')
const {addProduct,StoreDisplay, ProductPage,AddToCart} = require('./ServerProcessing/Product/ProductFunct')
const {sendEmail} = require('./Email/email')
const {dbConn} = require('../Config/db.config');

//configre express app
const app = express();
app.set('view engine', 'ejs');//use ejs
app.use(express.urlencoded({ extended: true }));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))//add bootsrap css
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')))//add bootsrap javascript
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')))//add bootsrap jquery
app.use(cookieParser());//change this and make it secrete
app.set('views', path.join(__dirname, '../Client/views'));//show express the views directory
app.use(express.static(path.join(__dirname, '../Client')));//show express the Client directory
app.use(express.static(path.join(__dirname, '../Pictures')));
app.use(express.static(path.join(__dirname, '../Partials')));
app.use(seshOption)//configuration for express session
app.use(upload())

//get requests 
app.get('/', function(req,res){
    let logged = ifLoggedHelper(req);
    res.render("Home",{logged});
});
app.get("/AccountPage",function(req,res){
    let logged = ifLoggedHelper(req);
    const user = req.session
    res.render("Account",{logged,user});
})
app.get("/AddProductPage",function(req,res){
    let logged = ifLoggedHelper(req);
    const user = req.session
    const error = "";
    res.render("AddProduct",{logged,user,error});
})
app.get("/EditProductPage",function(req,res){
    let logged = ifLoggedHelper(req);
    const user = req.session
    res.render("EditProduct",{logged,user});
})
app.get("/EditStoreLayoutPage",function(req,res){
    let logged = ifLoggedHelper(req);
    const user = req.session
    res.render("EditStoreLayout",{logged,user});
})
app.get('/StorePage/:Category', StoreDisplay);
app.get('/StorePage/Product/:id',ProductPage)
app.get('/CartPage', function(req,res){
    let logged = ifLoggedHelper(req);
    let Cart = req.cookies.Cart
    let display = []
    dbConn.query("SELECT * FROM Products",function(err,results){
        if(err){
            //if an error occures
            res.send(err)
        }
        else{
            for(let loop = 0; loop < Cart.length; loop++){
                display.push(results.find(product => product.id == Cart[loop]))
            }
            console.log(display)
            return res.render('Cart',{logged,display})
        }

    });


    
});
app.get('/AboutPage', function(req,res){
    let logged = ifLoggedHelper(req);
    res.render("About",{logged});
});
app.get('/PortfolioPage', function(req,res){
    let logged = ifLoggedHelper(req);
    res.render("Portfolio",{logged});
});
app.get('/ContactPage', function(req,res){
    let logged = ifLoggedHelper(req);
    res.render("Contact",{logged});
});
app.get('/LoginPage', function(req,res){
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
//sign out
app.get("/SignOut",function(req,res){
    req.session.UserName = null;
    req.session.FirstName = null;
    req.session.Lastname = null;
    req.session.Email = null;
    req.session.loggedIn = null;
    req.session.Admin = null;
    req.session.Code = null;
    res.redirect("/")
})

//post requests
app.post("/SignUp",SignUp);
app.post("/Login",Login);
app.post("/Authenticate",Authenticate);
app.post("/AddToCart/:id",AddToCart)



//test proj
app.get("/testFormPage",function(req,res){
    const error = ""
    
    res.render("testForm",{error})
})
app.post('/addProduct', addProduct);




app.listen(process.env.PORT || 3001, function () {//host site
    console.log("Port: 3000");
    
});