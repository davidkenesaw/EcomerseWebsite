const path = require('path')
require('dotenv').config({ 
    path: path.resolve(__dirname, '../.env') 
})
const mysql = require('mysql');
const session = require('express-session')
const mysqlStore = require('express-mysql-session')(session)

//cloud mysql db connection
const dbConn = mysql.createConnection({
  host     : process.env.DBHOST,
  port     : process.env.DBPORT,
  user     : process.env.DBUSER,
  password : process.env.DBPASSWORD,
  database : process.env.DBDATABASE
});

//session
const sessionStore = new mysqlStore({
  expiration: 10800000,
  creatDatabaseTable: true,
  schema: { 
    tableName:process.env.SESSIONTABLE,
    columnNames:{
      session_id: "session_id",
      expires:"expires",
      data:"data"
    }
  }
},dbConn)

const seshOption = session({
  key:"keyin",
  secret:process.env.SESSIONSECRETE,
  store:sessionStore,
  resave: false,
  saveUninitialized:false
})



//check if database gets connected
dbConn.connect(function(err) {
  if (err) {
    console.log("Database did not connect");
    
  }else{
    console.log("Database Connected!");
  }
  
});



module.exports = {dbConn,seshOption};