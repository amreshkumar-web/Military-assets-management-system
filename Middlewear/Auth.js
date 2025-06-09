require("dotenv").config();
const jwt=require("jsonwebtoken");
const SECRET_KEY=process.env.JWT_SECRET_KEY; 
const redisDb = require('../redisConnect')
const clearCookies = require('../utils/ClearCookies')



async function isTokenBlackListed(token) {
    try {
        const exists = await redisDb.get(`blackList:${token}`);
        return exists !== null; 
    } catch (error) {
        console.error("Error checking blacklist:", error);
        return false; 
    }
}


const AuthToken = async (req,resp,next) =>{
    const token =req.cookies?.accessToken;
    
    if(!token){
        return resp.status(400).send({message:"Authentication required. Please log in. || token not found"});
    }
    try{
        if( await isTokenBlackListed(token)){
            clearCookies(resp); 
            return resp.status(440).json({message:"User has been logged out."})
        }
        
        jwt.verify(token,SECRET_KEY , (err,decode)=>{
           if(err) {
            console.log("token error" + err)
             return resp.status(401).json({message:"Token Expire"})
           }
          req.user=decode;
          next();
        })
    }
    catch(err){
        console.log(err)
        resp.status(401).json({message:"Error in Middlewear auth"});
    }
    }
    
    module.exports = AuthToken;
