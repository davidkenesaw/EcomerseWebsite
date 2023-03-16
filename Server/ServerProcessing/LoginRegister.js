const {dbConn} = require('../../Config/db.config');
const bcrypt = require('bcrypt')


const saltRounds = 10;

function Login(req,res){
    const user = req.body.UserName;
    const Password = req.body.Password;//add use of password

    //database query
    dbConn.query("SELECT * FROM Users WHERE UserName = ?", [user], function (err, rows) {

        //if an error occures
        if (err) {
            const error = "there was an issue with your username or password";
            res.render('Login', { error });
        }
        else {//log user in the redirect to Codepage
            if (rows.length == 1) {
                bcrypt.compare(Password, rows[0].Password, function (err, result) {
                    if (result == true) {//if logged in is successful
                        req.session.UserName = rows[0].UserName;
                        req.session.FirstName = rows[0].FirstName;
                        req.session.LastName = rows[0].LastName;
                        req.session.Email = rows[0].Email;
                        //add user info to users session
                        req.session.loggedIn = true;
                        req.session.Admin = rows[0].Admin;
                        res.redirect('/TwoStepAuthPage');
                    } else {
                        const error = "UserName or Password is wrong";
                        res.render('Login', { error });//this is wrong
                    }
                });

            } else {//could not find user or password wrong
                const error = "issue with username";
                res.render('Login', { error });//this is wrong
            }
        }

    });
}
function SignUp(req,res){
    const UserName = req.body.UserName;
    const Password = req.body.Password;

    const FirstName = req.body.FirstName;
    const LastName = req.body.LastName;
    const Email = req.body.Email;

    //encrypt 
    bcrypt.hash(Password, saltRounds, function (err, hash) {
        //database query
        dbConn.query("INSERT INTO Users (UserName,Password,FirstName,LastName,Email) VALUES (?,?,?,?,?)", [UserName, hash, FirstName, LastName, Email], function (err, result) {

            //if an error occures
            if (err) {
                console.log(err)
                const error = "User Taken";
                res.render('SignUp', { error });
            } else {//register user
                const error = "Signed in"
                console.log("Data inserted");
                res.render("SignUp",{error});//change back to redirect
            }
        });
    });
}
function Authenticate(req,res){
    const code = req.body.Code
    console.log(code + " " + req.session.Code)
    if(code == req.session.Code){
        res.redirect("/")
    }else{
        const error = "Code was wrong"
        res.render("TwoStepAuth",{error})
    }
}
function ifLoggedHelper(req){
    let obj = {
        user:false,
        admin:false
    };
    if(req.session.UserName){
        obj.user = true
    }
    if(req.session.Admin == 1){
        obj.admin = true
    }
    return obj;
}

module.exports = {SignUp, Login, Authenticate,ifLoggedHelper};