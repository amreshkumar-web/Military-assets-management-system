const nodemailer = require('nodemailer');
require('dotenv').config();
const transport = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'amreshkumqr1@gmail.com',
        pass:process.env.NODEMAILER_SECRET_CODE
    }
})

const sendOtp = async (email,otp) =>{
    const mailOptions = {
   from:'amreshkumqr1@gmail.com',
   to:email,
   subject:'Your OTP code',
   text:`Your OTP code is ${otp} please use it to verify your account`
    }

    try {
        
        let info = await transport.sendMail(mailOptions);
        console.log('Email Sent: ' + info.response);
        return true;  
    } catch (err) {
        console.log('Error when sending mail: ', err);
        return false;  
    }
};

//Now time to send this mail



module.exports = sendOtp;