const nodemailer = require('nodemailer');

require('dotenv').config();

const {AUTH_EMAIL,AUTH_PASS} = process.env;


console.log(AUTH_EMAIL);
console.log(AUTH_PASS);



//Create a transporter
let mailTransporter = nodemailer.createTransport({
    service:'Gmail',
    auth:{
        user : AUTH_EMAIL,
        pass : AUTH_PASS
    },
    tls : {
        rejectUnauthorized : false
    }

});

// verify transport configuration
mailTransporter.verify((error,success) => {
    if(error) {
        console.log("Error verifying transporter : ",error);
    } else {
        console.log("Transporter is ready to send Emails");
        console.log(success);
    }
})


//here we can sent mail
const sendEmail = async (mailOptions) => {
    try {
        await mailTransporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (err) {
        console.log("Error sending email:", err);
    }
};


module.exports ={
    mailTransporter,
    sendEmail
}