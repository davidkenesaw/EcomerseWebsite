const {dbConn} = require('../../../Config/db.config');
const {Receipt} = require('../../Email/email')

const paypal = require('paypal-rest-sdk')
paypal.configure({
    'mode':'sandbox',
    'client_id':'AXKybnkFLcVG4hfR9H2SXEGEemXsPS42wC5b58g0k-YXpxRFN71viGfN7w6Nr-3cYUql48iZTgi19XC3',
    'client_secret':'EHLaX9NW4HXfT3spXJBM_vB6E1R_mlq8yu9h9Vsezc5UDOnSOypmgbyCBn6EchJyCNQeGRdwU0Yub5Qo'
})

function createPayment(req,res){
    let Address = req.body.Address;
    let Zip = req.body.ZipCode;
    let City = req.body.City;
    let State = req.body.State;
    let Email = req.body.Email;
    
    let itemList =[
        //name: item,
        //sku: item,
        //price: 1.00,
        //currency: USD,
        //quantity: 1
    ]
    let Cart = req.cookies.Cart

    dbConn.query("SELECT * FROM Products", function(err,productList){
        if(err){
            res.send(err)
        }else{
            let total = 0
            for(let loop = 0; loop < Cart.length; loop++){
                itemList.push({
                    name: productList.find(prod => prod.id == Cart[loop].id).ProductName,
                    sku: String(productList.find(prod => prod.id == Cart[loop].id).id),
                    price: productList.find(prod => prod.id == Cart[loop].id).Cost,
                    currency: "USD",
                    quantity: parseInt(Cart[loop].amount)
                })
                total += (parseInt(productList.find(prod => prod.id == Cart[loop].id).Cost)*parseInt(Cart[loop].amount))
                
            }
            
            console.log(total)
            

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
                            "price": String(total),
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": String(total)
                    },
                    "description": "This is the payment description."
                }]
            };
            
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    req.session.CartCheckOut = {
                        totalCost:String(total),
                        Zip:Zip,
                        state:State,
                        city:City,
                        address:Address,
                        Email:Email,
                        products: itemList
                    }
                    for(let loop = 0; loop < payment.links.length; loop++){
                        if(payment.links[loop].rel == 'approval_url'){
                            res.redirect(payment.links[loop].href)
                        }
                    }
                }
            });
        }
    })
}

function confirmPayment(req, res)  {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    let total = req.session.CartCheckOut.totalCost
    let Cart = req.cookies.Cart;
    
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
        "amount": {
          "currency": "USD",
          "total": String(total)
        }
      }]
    }
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        
        for(let loop = 0; loop < Cart.length; loop++){
            dbConn.query("UPDATE Products SET Stock = Stock - ? WHERE id = ?",[Cart[loop].amount,Cart[loop].id],function(err){
                if(err){
                    console.log(err)
                }else{
                    console.log("stock updated for " + Cart[loop].id)
                }
            })
        }

        Receipt("davidkennesaw@gmail.com",req.session.CartCheckOut)
        Receipt(req.session.CartCheckOut.Email,req.session.CartCheckOut)
        res.cookie("Cart",[])
        res.redirect('/');
      }
    });
  }
  module.exports={confirmPayment,createPayment}