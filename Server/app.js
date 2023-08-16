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
const {addProduct,StoreDisplay, ProductPage,AddToCart, EditLayout, DeleteCatagory, AddCatagory, EditProductDisplay,EditProductPage, EditName, EditCatagory, EditDescription, EditCost, EditStock, EditPic, DeleteProduct} = require('./ServerProcessing/Product/ProductFunct')
const {sendEmail, EmailFromWeb, Receipt} = require('./Email/email')
const {dbConn} = require('../Config/db.config');
const {confirmPayment, createPayment} = require('./ServerProcessing/Product/Paypal')

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

//this is a new change

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
app.get("/OrdersPage",function(req,res){
    let logged = ifLoggedHelper(req);
    
    res.render("Orders",{logged});
})
app.get("/AddProductPage",function(req,res){
    let logged = ifLoggedHelper(req);
    
    const error = "";
    res.render("AddProduct",{logged,error});
})
app.get("/EditProductPage",EditProductDisplay)
app.get("/EditStoreLayoutPage",EditLayout)
app.get('/StorePage/:Category', StoreDisplay);
app.get('/StorePage/Product/:id',ProductPage)
app.get('/EditProduct/:id',EditProductPage)
app.get('/CartPage', function(req,res){
    //test rules
    if(req.cookies.Cart == null){
        res.cookie("Cart",[])
        return res.redirect("/CartPage")
    }
    
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
                display.push(results.find(product => product.id == Cart[loop].id))
                display[loop].amount = Cart[loop].amount
            }
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
app.get('/CheckOutPage', function(req,res){
    let logged = ifLoggedHelper(req);
    res.render("CheckOut",{logged});
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
app.post('/addProduct', addProduct);
app.post('/DeleteCart/:id', function(req,res){
    const productID = req.params.id
    let Cart = req.cookies.Cart
    Cart = Cart.filter(product => product.id!=productID)
    res.cookie("Cart",Cart)

    res.redirect("/CartPage")
});
app.post('/ContactSend', EmailFromWeb);
app.post('/DeleteCatagory/:id', DeleteCatagory)
app.post('/AddCatagory', AddCatagory)
app.post('/EditName/:id', EditName)
app.post('/EditCatagory/:id', EditCatagory)
app.post('/EditDescription/:id', EditDescription)
app.post('/EditCost/:id', EditCost)
app.post('/EditStock/:id', EditStock)
app.post('/EditPic/:id', EditPic)
app.post('/DeleteProduct/:id', DeleteProduct)

//paypal
app.post('/CheckOut',createPayment)
app.get('/success', confirmPayment);

app.listen(process.env.PORT || 3001, function () {//host site
    console.log("Port: 3000");
    
});