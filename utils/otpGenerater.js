
const sendOtp = require('./mailer');
const crypto = require('crypto');
const redisDb = require('../redisConnect');


const generateOtp = async (username,name=null,password=null,operation) =>{
 
    if(!username || !operation) return false;
try {
    const otp = crypto.randomInt(100000,999999);
if(await sendOtp(username,otp)){
    
    const redisMapData ={};
    if (name) redisMapData.name = name; 
    if (password) redisMapData.password = password;  
redisMapData.otp = otp;  
redisMapData.operation = operation;  
   
    const redisMap = await redisDb.hSet(`${operation}-${username}`,redisMapData)
    await redisDb.expire(`${operation}-${username}`, 300);

    if(redisMap===0 || redisMap===1){
        return true;
    }
    return true;
}
else{
    console.log('Failed to send OTP');
   return false
}
} catch (error) {
    console.log('Error in Otp generator' , error);
    return false;
}

}


module.exports = generateOtp;

