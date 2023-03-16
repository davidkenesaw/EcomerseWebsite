const {dbConn} = require('../../Config/db.config');
//test proj

function addProduct(req, res) {
    const ProductName = req.body.Name;
    const Category = req.body.Category;

    const Description = req.body.Description;
    const Cost = req.body.Cost;
    const Pic ="../img/" + ProductName + ".jpg";
    //database query

    dbConn.query("INSERT INTO Products (ProductName,Category,Description,Cost,Pic) VALUES (?,?,?,?,?)", [ProductName,Category,Description,Cost,Pic], function (err, result) {
        //if an error occures
        if (err) {
            console.log(err)
            const error = "name taken";
            res.render('testForm', { error });
        } else {//register user
            let error = "Product inserted"
            console.log("Product inserted");
            const path = "../Client/img/"+ ProductName+".jpg"
            console.log(path)
            req.files.sampleFile.mv(path, function(err){
                if(err){
                    error = "something wrong with path"
                    res.render("testForm",{error})            
                }else{
                    res.render("testForm",{error})
                }
            });
        }
    });
}

function StoreDisplay(req, res){
    let logged;
    let name;
    let catagory;
    let newListItems;
    if(req.session.UserName){
        name = req.session.FirstName
        logged = true
    }else{
        logged = false
    }
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
                        res.render('Store',{logged,name,newListItems,catagory});
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
                        res.render('Store',{logged,name,newListItems,catagory});
                    }

                });
            }
 
        }

    });
    
  
}
function ProductPage(req,res){
    let logged;
    let name;
    if(req.session.UserName){
        name = req.session.FirstName
        logged = true
    }else{
        logged = false
    }
    
    const id = req.params.id
    dbConn.query("SELECT * FROM Products WHERE id = ?",[id],function(err,results){
        if(err){
            res.redirect("/StorePage/All")
        }else{
            const product = results;
            res.render("ProductPage",{logged,name,product})
            //res.send(product)
        }
    })
}
module.exports = {addProduct, StoreDisplay, ProductPage};