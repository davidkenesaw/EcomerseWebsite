//require statements
const path = require('path')
require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
})
const express = require("express");
const upload = require("express-fileupload")
const cookieParser = require('cookie-parser');
const paypal = require('paypal-rest-sdk')
const { seshOption } = require('../Config/db.config')
const {SignUp, Login, Authenticate, ifLoggedHelper} = require('./ServerProcessing/LoginRegister')
const {addProduct,StoreDisplay, ProductPage,AddToCart} = require('./ServerProcessing/Product/ProductFunct')
const {sendEmail, EmailFromWeb} = require('./Email/email')
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
paypal.configure({
    'mode':'sandbox',
    'client_id':'AXKybnkFLcVG4hfR9H2SXEGEemXsPS42wC5b58g0k-YXpxRFN71viGfN7w6Nr-3cYUql48iZTgi19XC3',
    'client_secret':'EHLaX9NW4HXfT3spXJBM_vB6E1R_mlq8yu9h9Vsezc5UDOnSOypmgbyCBn6EchJyCNQeGRdwU0Yub5Qo'
})

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

app.post('/CheckOut',function(req,res){
    let itemList =[
        //name: item,
        //sku: item,
        //price: 1.00,
        //currency: USD,
        //quantity: 1
    ]
    let item={
        name: "item",
        sku: "item",
        price: 1.00,
        currency: "USD",
        quantity: 1
    }
    let Cart = req.cookies.Cart
    
    dbConn.query("SELECT * FROM Products", function(err,productList){
        if(err){
            res.send(err)
        }else{
            let total = 0
            for(let loop = 0; loop < Cart.length; loop++){
                item.name = productList.find(prod => prod.id == Cart[loop].id).ProductName
                item.sku = String(productList.find(prod => prod.id == Cart[loop].id).id)
                item.price = productList.find(prod => prod.id == Cart[loop].id).Cost
                item.currency = "USD"
                item.quantity = parseInt(Cart[loop].amount)
                itemList.push(item)
                total += (parseInt(productList.find(prod => prod.id == Cart[loop].id).Cost)*parseInt(Cart[loop].amount))
            }
            console.log(itemList)
            console.log(total)

            const item_list = JSON.stringify(itemList)
            var create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3001/success",
                    "cancel_url": "http://localhost:3001/CartPage"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "item",
                            "sku": "item",
                            "price": "10.00",
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": "10.00"
                    },
                    "description": "This is the payment description."
                }]
            };
            console.log(create_payment_json)
            
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    for(let loop = 0; loop < payment.links.length; loop++){
                        if(payment.links[loop].rel == 'approval_url'){
                            res.redirect(payment.links[loop].href)
                        }
                    }
                }
            });
            

        }
    })
    

    
})
app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    console.log(req)
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
        "amount": {
          "currency": "USD",
          "total": "10.00"
        }
      }]
    }
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
      }
    });
  });

app.listen(process.env.PORT || 3001, function () {//host site
    console.log("Port: 3000");
    
});