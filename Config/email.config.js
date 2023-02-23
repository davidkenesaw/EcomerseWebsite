const path = require('path')
require('dotenv').config({ 
    path: path.resolve(__dirname, '../.env') 
})
const sgMail = require('@sendgrid/mail')

//email api
sgMail.setApiKey(process.env.EMAILKEY)


module.exports = {sgMail}