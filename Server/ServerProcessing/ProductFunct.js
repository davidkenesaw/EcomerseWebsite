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
            var error = "Product inserted"
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

function displayProducts(req, res){
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
}
module.exports = {addProduct,displayProducts};