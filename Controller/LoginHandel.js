const User = require('../models/User')
const Session = require('../models/SessionToken')
const bycrypt = require('bcryptjs');
const generateOtp = require('../utils/otpGenerater');
const otpVerifier = require('../utils/otpVerifier')
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const redisDb = require('../redisConnect');
const clearCookies = require('../utils/ClearCookies')

require('dotenv').config();


const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };




const loginUser = async (req,resp) =>{
    const {username,password} = req.body;
    
try {
    if(!username || !password) return resp.status(400).json({message:"Invalid Input"});
    if(!validateEmail(username)) return resp.status(400).json({message:"Invalid Email"});
    if(!validatePassword(password)) return resp.status(400).json({message:"Invalid Password"})
    const userData = await User.findOne({where:{username}});
    if(!userData) return resp.status(404).json({message:"User Not Found"});
    const {id} = userData
    const hashedPassword = userData.password
   
    const isValidPassword = await bycrypt.compare(password,hashedPassword);
   
    if(!isValidPassword) return resp.status(400).json({message:"Invalid Password"});
 
    const accessToken = jwt.sign({jUserId:userData.id,jUserAccess:userData.access,jUserBaseId:userData.base_id},process.env.JWT_SECRET_KEY,{ expiresIn: "15m" });
    console.log(accessToken + "login AT")
    const refreshToken = jwt.sign({jUserId:userData.id,jUserAccess:userData.access,jUserBaseId:userData.base_id},process.env.JWT_SECRET_KEY,{ expiresIn: "240h" });
  const hashedRefreshToken = await bycrypt.hash(refreshToken,10);
  const [updatedRows] = await Session.update(
    {
        refreshToken: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    },
    { where: { id: id } }
);


if (updatedRows === 0) {
    return resp.status(500).json({ message: "Something Went Wrong" });
}
//generating csrf token

const csrfToken = crypto.randomBytes(32).toString('hex');
const hashedCsrfToken = await bycrypt.hash(csrfToken,10);
resp.cookie('XSRF-TOKEN',hashedCsrfToken,{
    httpOnly:true,
    secure:true,
    sameSite:"None", // Changed from "Lax" to "None" for cross-origin
    maxAge: 10 * 24 * 60 * 60 * 1000 // Fixed: removed Date object, just milliseconds
})

resp.cookie('accessToken',accessToken,{
    httpOnly:true,
    secure:true,
    sameSite:"None", // Changed from "Lax" to "None" for cross-origin
    maxAge: 10 * 24 * 60 * 60 * 1000 // Fixed: removed Date object, just milliseconds
})

resp.cookie('refreshToken',refreshToken,{
    httpOnly:true,
    secure:true,
    sameSite:"None", // Changed from "Lax" to "None" for cross-origin
    maxAge: 10 * 24 * 60 * 60 * 1000 // Fixed: removed Date object, just milliseconds
})
resp.status(200).json({message:"Login Successfully",xCsrfToken:csrfToken});

} catch (error) {
    console.log("Error in login", error)
    return resp.status(500).json({message:"Something Went Wrong"});
}
}



/* ------------------------------------------------------------------------------------ */




const registerUser = async (req,resp) =>{
  const {username,name,password} = req.body;
try {
    if(!username || !password || !name) return resp.status(400).json({message:"Invalid Input"});
    if(!validateEmail(username)) return resp.status(400).json({message:"Invalid Email"});
    if(!validatePassword(password)) return resp.status(400).json({message:"Invalid Password"})
    const response = await User.findOne({where : {username}});
    if(response) return resp.status(409).json({message:"User Already Exist"});
    const hashPassword = await bycrypt.hash(password.trim(),10);
    
    const otpStatusCheck = await generateOtp(username , name ,hashPassword,"registration");
    if(!otpStatusCheck){
        console.log("otp generator failed");
         return resp.status(500).json({message:"Failed to generate otp Pls try again"});
    } 
    return resp.status(201).json({message:"Otp is Generated"});
    
} catch (error) {
    console.log('registration error',error);
    return resp.status(500).json({message:"Internal server error, pls try again"});
}

}
    





const checkOtp = async (req,resp) =>{
    try {
        const{username,otp} = req.body;
        
        if(!username || !otp) return resp.status(400).json({message:"Bad request"});
        const intOtp = parseInt(otp,10)
        const otpStatusCheck = await otpVerifier(username,intOtp,"registration");
       
        if(!otpStatusCheck) return resp.status(400).json({message:"OTP expire pls try again later"})
            const{password,name} = otpStatusCheck;

        const response = await User.create({username,name,password});
        if(!response) return resp.status(500).json({message:"Internal server error, pls"});
        const SessionData = await Session.create({id:response.id,expiresAt:Date.now()});
        if(!SessionData) return resp.status(500).json({message:"Session Expire"});
        return resp.status(201).json({message:"User created successfully",response});

    } catch (error) {
        console.log("Error in checkOtp LoginController" , error);
        return resp.status(500).json({message:"Internal server error, pls"});
    }
}







//token refresh


const tokenRefresh = async (req,resp)=>{
const refreshToken = req.cookies?.refreshToken;
const accessToken = req.cookies?.accessToken;

if(!refreshToken) return resp.status(401).json({message:"Unauthorized, token missing!"});


try {
   
const checkJwt = jwt.verify(refreshToken,process.env.JWT_SECRET_KEY);
if(!checkJwt){
    clearCookies(resp);
    resp.status(401).json({message:"Token is Expired"});
}
const {jUserId,jUserAccess,jUserBaseId} = checkJwt;

const findSessionToken = await Session.findOne(
    {
        where:{id:jUserId},
        attributes:['refreshToken','expiresAt']
    }
)

if(!findSessionToken) return resp.status(400).json({message:"Session is expired pls login"});


const currentTime = new Date();
if(!findSessionToken.refreshToken) return resp.status(400).json({message:"Pls login Again"});
if(currentTime > findSessionToken.expiresAt){
    clearCookies(resp);
    return resp.status(400).json({message:"Session is expired"})
}
const verifyBothToken = await bycrypt.compare(refreshToken,findSessionToken.refreshToken);
if(!verifyBothToken) return resp.status(401).json({message:"Token is invalid"});
const newAccessToken = jwt.sign({jUserId:jUserId,jUserAccess:jUserAccess,jUserBaseId:jUserBaseId},process.env.JWT_SECRET_KEY,{ expiresIn: "15m" }); //change
const newRefreshToken = jwt.sign({jUserId:jUserId,jUserAccess:jUserAccess,jUserBaseId:jUserBaseId},process.env.JWT_SECRET_KEY,{ expiresIn: "240h" });
const hashedNewRefreshToken = await bycrypt.hash(newRefreshToken,10);
const [updatedRows] = await Session.update(
    {
        refreshToken: hashedNewRefreshToken,
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    },
    { where: { id: jUserId } }
);

// Check if any row was updated
if (updatedRows === 0) {
    return resp.status(500).json({ message: "Internal Server Error" });
}

resp.cookie('accessToken',newAccessToken,{
    httpOnly:true,
    secure:true,
    sameSite:"None",
    maxAge:new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) 
})
resp.cookie('refreshToken',newRefreshToken,{
    httpOnly:true,
    secure:true,
    sameSite:"None",
    maxAge:new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
})
return resp.status(200).json({message:"Session Refreshed"});

} catch (error) {
    console.log("Error During Token Refreshment", error)
    return resp.status(500).json({message:"Something Went Wrong"});
}

}






//otp Generator for rest Password
const generateOtpResetPassword = async (req,resp) =>{
    const {username} =req.body;
    if(!username) return resp.status(400).json({message:"Bad Request"});

    try {
        const operation="resetPassword"
        const otpStatusCheck = await generateOtp(username,null,null ,operation);
        if(!otpStatusCheck){
            console.log("otp generator failed");
             return resp.status(500).json({message:"Failed to generate otp Pls try again"});
        } 
        return resp.status(201).json({message:"Otp is Generated"});


    } catch (error) {
        console.log("Error in generateOtp Login Handeler", error);
        return resp.status(500).json({message:"Something went wrong"});
    }
}












//check user exist or not for reset password

const checkUserExist = async (req, resp) => {

const{username} = req.body;

if(!username) return  resp.status(400).json({message:"User not found"});
try {
    const user = await User.findOne({where:{username:username}});
    if(!user) return resp.status(404).json({message:"User not found"});
    return resp.status(200).json({message:"User found"});
} catch (error) {
    console.log("Error in checkUserExistance",error);
    return resp.status(500).json({message:"Something Went Wrong"});
}

}





//reset Password

const resetPassword = async (req,resp)=>{
const {username,password,otp} = req.body;

if(!password || !username || !otp) return resp.status(400).json({message:"Bad Request"});

try {
    const otpStatusCheck = await otpVerifier(username,otp,"resetPassword");
    
    if(!otpStatusCheck) return resp.status(400).json({message:"OTP expire pls try again later"})
    const hashedPassword = await bycrypt.hash(password,10);
    const [updatedRows] = await User.update(
        { password: hashedPassword },
        { where: { username: username } }
    );
    
    if (updatedRows === 0) {
        return resp.status(500).json({ message: "Something Went Wrong" });
    }
    
    return resp.status(200).json({ message: "Password Changed Successfully" });


} catch (error) {
    console.log("Error in reset Password",error);
    return resp.status(500).json({ message: "Something Went Wrong" });
}


}







const UserVerfication = async (req,resp) =>{
try {
    resp.status(200).json({message:"UserValidate"});
} catch (error) {
    resp.status(500).json({message:"Something Went wrong"});
}
}




async function blackList(token, expireInSec) {
    await redisDb.setEx(`blackList:${token}`, expireInSec, token);
    return true; 
}




const handelLogout = async (req,resp) =>{
    const {jUserId} = req.user;
    try {
          
        const accessToken = req.cookies?.accessToken;
       if(!accessToken) return resp.status(500).status("Something went wrong");
  
       const sessionClear = await Session.update(
        { refreshToken: null, expireAt: new Date() },
        { where: { id: jUserId } }  
      );

      if(!sessionClear) return resp.status(500).json({message:"Something Went Wrong"});

       const isTokenBlackListed = await blackList(accessToken,900);
       if(!isTokenBlackListed) return resp.status(500).json({message:"Something Went Wrong"})
       clearCookies(resp);
       resp.status(200).json({ message: "Logged Out" });

    } catch (error) {
        clearCookies(resp);
        return resp.status(500).json({message:"Something Went Wrong"})
    }
}





module.exports = {loginUser,registerUser,checkOtp,tokenRefresh,checkUserExist,resetPassword,generateOtpResetPassword,UserVerfication,handelLogout};