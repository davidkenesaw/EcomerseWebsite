const {dbConn} = require('../../../Config/db.config');
const {ifLoggedHelper} = require('../LoginRegister')
//test proj

function addProduct(req, res) {
    let logged = ifLoggedHelper(req);
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
            res.render('AddProduct', { logged,error });
        } else {//register user
            
            let error = "Product inserted"
            console.log("Product inserted");
            
            dbConn.query("SELECT id from Products ORDER BY id DESC LIMIT 1", function (err, id) {
                if(err){
                    res.send(err)
                }else{
                    Pic ="../img/" + ProductName.replace(/\s/g, '') + id[0].id + ".jpg";
                    const path = "../Client/img/"+ ProductName.replace(/\s/g, '') + id[0].id+".jpg"
                    console.log(path)
                    dbConn.query("UPDATE Products SET Pic = ? WHERE id = ?", [Pic,id[0].id], function (err) {
                        
                        req.files.sampleFile.mv(path, function(err){
                            if(err){
                                error = "something wrong with path"
                                res.render("AddProduct",{logged,error})            
                            }else{
                                res.render("AddProduct",{logged,error})
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
    
    let alert1 = CurrentCart.find(pr=>pr.id==product)
    
    if(alert1 == null){
        const obj = {
            id:product,
            amount:amount
        }
        CurrentCart.push(obj)
        
    }else{
        let i = CurrentCart.findIndex(pr => pr.id == product)
        CurrentCart[i].amount = amount
        
    }

    res.cookie("Cart",CurrentCart)
    res.redirect("/CartPage")

}
//Display EditLayoutPage
function EditLayout(req,res){
    let logged = ifLoggedHelper(req);
    dbConn.query("SELECT * FROM StoreCategory",function(err,rows){
    catagory = rows;
        if(err){
            //if an error occures
            res.send(err)
        }
        else{
            res.render('EditStoreLayout',{logged,catagory});
        }

    });
}
function DeleteCatagory(req,res){
    let id = req.params.id;
    dbConn.query("DELETE FROM StoreCategory WHERE Catagory = ?",[id],function(err,rows){
        if(err){
            //if an error occures
            res.send(err)
        }
        else{
            res.redirect('/EditStoreLayoutPage');
        }

    });
}
function AddCatagory(req,res){
    let Catagory = req.body.Catagory
    dbConn.query("INSERT INTO StoreCategory(Catagory) VALUES(?)",[Catagory],function(err,rows){
        if(err){
            //if an error occures
            res.send(err)
        }
        else{
            res.redirect('/EditStoreLayoutPage');
        }

    });
}

//edit product

function EditProductDisplay(req,res){
    let logged = ifLoggedHelper(req);
    dbConn.query("SELECT * FROM Products",function(err,results){
        if(err){
            //if an error occures
            res.send(err)
        }
        else{
            newListItems = results;
            res.render('EditProductDisplay',{logged,newListItems});
        }

    });
}
function EditProductPage(req,res){
    let logged = ifLoggedHelper(req);
    const id = req.params.id
    dbConn.query("SELECT * FROM Products WHERE id = ?",[id],function(err,results){
        if(err){
            res.send("err")
        }else{
            const product = results;
            res.render("EditProductPage",{logged,product})
            //res.send(product)
        }
    })
}
function EditName(req,res){
    let name = req.body.Name
    let id = req.params.id
    dbConn.query("UPDATE Products SET ProductName = ? WHERE id = ?", [name, id], function(err){
        if(err){
            res.send(err)
        }else{
            res.redirect("/EditProduct/" + id)
        }
    })
}
function EditCatagory(req,res){
    let catagory = req.body.Catagory
    let id = req.params.id
    dbConn.query("UPDATE Products SET Category = ? WHERE id = ?", [catagory, id], function(err){
        if(err){
            res.send(err)
        }else{
            res.redirect("/EditProduct/" + id)
        }
    })
}
function EditDescription(req,res){
    let description = req.body.Description
    let id = req.params.id
    dbConn.query("UPDATE Products SET Description = ? WHERE id = ?", [description, id], function(err){
        if(err){
            res.send(err)
        }else{
            res.redirect("/EditProduct/" + id)
        }
    })
}
function EditCost(req,res){
    let Cost = req.body.Cost
    let id = req.params.id
    dbConn.query("UPDATE Products SET Cost = ? WHERE id = ?", [Cost, id], function(err){
        if(err){
            res.send(err)
        }else{
            res.redirect("/EditProduct/" + id)
        }
    })
}
function EditStock(req,res){
    let Stock = req.body.Stock
    let id = req.params.id
    dbConn.query("UPDATE Products SET Stock = ? WHERE id = ?", [Stock, id], function(err){
        if(err){
            res.send(err)
        }else{
            res.redirect("/EditProduct/" + id)
        }
    })
}
function EditPic(req,res){
    let id = req.params.id
    dbConn.query("SELECT ProductName FROM Products WHERE id = ?", [id], function(err, ProductName){
        if(err){
            res.send(err)
        }else{
            let name = ProductName[0].ProductName
            let FileName = name.replace(/\s/g, '') + id + ".jpg";
            const path = "../Client/img/"+ FileName

            req.files.ProductPic.mv(path, function(error){
                if(error){
                    res.send(error)           
                }else{
                    res.redirect("/EditProduct/" + id)
                }
            }); 

        }
    })



    





       
}

module.exports = {addProduct, StoreDisplay, ProductPage, AddToCart, EditLayout, DeleteCatagory, AddCatagory, EditProductDisplay,EditProductPage, EditName, EditCatagory, EditDescription, EditCost, EditStock, EditPic};