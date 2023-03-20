const {dbConn} = require('../../../Config/db.config');
const {ifLoggedHelper} = require('../LoginRegister')
//test proj

function addProduct(req, res) {
    const ProductName = req.body.Name;
    const Category = req.body.Category;

    const Description = req.body.Description;
    const Cost = req.body.Cost;
    const Stock = req.body.Stock;
    let Pic;
    
    //database query

    
    dbConn.query("INSERT INTO Products (ProductName,Category,Description,Cost,Stock) VALUES (?,?,?,?,?)", [ProductName,Category,Description,Cost,Stock], function (err, result) {
        if (err) {
            console.log(err)
            const error = "name taken";
            res.render('testForm', { error });
        } else {//register user
            
            let error = "Product inserted"
            console.log("Product inserted");
            
            dbConn.query("SELECT id from Products ORDER BY id DESC LIMIT 1", function (err, id) {
                if(err){

                }else{
                    Pic ="../img/" + ProductName.replace(/\s/g, '') + id[0].id + ".jpg";
                    const path = "../Client/img/"+ ProductName.replace(/\s/g, '') + id[0].id+".jpg"
                    console.log(path)
                    dbConn.query("UPDATE Products SET Pic = ? WHERE id = ?", [Pic,id[0].id], function (err) {
                        
                        req.files.sampleFile.mv(path, function(err){
                            if(err){
                                error = "something wrong with path"
                                res.render("testForm",{error})            
                            }else{
                                res.render("testForm",{error})
                            }
                        });
                    })
                }
            })
        }
    });
}
        

        

function StoreDisplay(req, res){
    let catagory;
    let newListItems;
    let logged = ifLoggedHelper(req);
    dbConn.query("SELECT * FROM StoreCategory",function(err,rows){
        if(err){
            //if an error occures
            res.send(err)
        }
        else{

            if(req.params.Category == "All"){
                catagory = rows;
                dbConn.query("SELECT * FROM Products",function(err,results){
                    if(err){
                        //if an error occures
                        res.send(err)
                    }
                    else{
                        newListItems = results;
                        res.render('Store',{logged,newListItems,catagory});
                    }

                });
            }else{
                catagory = rows;
                dbConn.query("SELECT * FROM Products WHERE Category = ?",[req.params.Category],function(err,results){
                    if(err){
                        //if an error occures
                        res.send(err)
                    }
                    else{
                        newListItems = results;
                        res.render('Store',{logged,newListItems,catagory});
                    }

                });
            }
 
        }

    });
    
  
}
function ProductPage(req,res){
    let logged = ifLoggedHelper(req);
    const id = req.params.id
    dbConn.query("SELECT * FROM Products WHERE id = ?",[id],function(err,results){
        if(err){
            res.redirect("/StorePage/All")
        }else{
            const product = results;
            res.render("ProductPage",{logged,product})
            //res.send(product)
        }
    })
}
function AddToCart(req,res){
    const product = req.params.id
    const amount = req.body.Amount
    if(req.cookies.Cart == null){
        res.cookie("Cart",[])
        return res.redirect(307, "/AddToCart/"+product)
    }
     
    let CurrentCart= []
    CurrentCart = req.cookies.Cart;
    
    
    for(let loop = 0; loop < amount; loop++){
        CurrentCart.push(product)
    }
    console.log(req.cookies.Cart)
    res.cookie("Cart",CurrentCart)

    res.redirect("/CartPage")

}
module.exports = {addProduct, StoreDisplay, ProductPage, AddToCart};