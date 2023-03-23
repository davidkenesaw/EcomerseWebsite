const { sgMail } = require('../../Config/email.config')

function sendEmail(To, code) {
    //function that sends email of code to user
    const msg = {
        to: To,
        from: process.env.EMAIL,
        subject: 'Authentication',
        text: 'Type in the code:' + code + ", to authenticate"
    }
    sgMail.send(msg).then(() => {
        console.log('Email sent')
    })
    .catch((error) => {
        console.error(error)
    })
}
function EmailFromWeb(req, res) {
    let name = req.body.FirstName + " " +req.body.LastName
    let email = req.body.Email
    let content = req.body.Content
    
    //function that sends email of code to user
    const msg = {
        to: process.env.OWNEREMAIL,
        from: process.env.EMAIL,
        subject: 'Commision',
        text: 'Name: ' + name +"\n"+
        "Email: " + email + "\n" + 
        "Content: " + content

    }
    sgMail.send(msg).then(() => {
        console.log('Email sent')
    })
    .catch((error) => {
        console.error(error)
    })

    res.redirect('/ContactPage')

}
module.exports = {sendEmail, EmailFromWeb};