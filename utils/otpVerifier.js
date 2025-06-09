const redisDb = require('../redisConnect');
const User = require("../models/User")

const otpVerifier = async (username,userOtp,userOperation) =>{

    try {
    const userData = await redisDb.hGetAll(`${userOperation}-${username}`);
    
    if(!userData) return false;
    const {otp,name,operation,password} = userData;
   
const orignalOtp = parseInt(otp,10);
const userOrignalOtp = parseInt(userOtp,10)
    if(operation === userOperation && orignalOtp === userOrignalOtp){
      const deleteUserData = await redisDb.del(`${userOperation}-${username}`);
      return {name,password}
    };
    return false;

    } catch (error) {
      console.log("Error in Otp verification :" , error)
      return false;        
    }

}

module.exports = otpVerifier;