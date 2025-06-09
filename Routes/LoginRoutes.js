const express = require('express');
const loginRoutes = express.Router();
const {loginUser,registerUser,checkOtp,tokenRefresh,resetPassword,generateOtpResetPassword,checkUserExist,UserVerfication,handelLogout}= require('../Controller/LoginHandel')
const {RateLimiterMiddleware, createRateLimiter} = require("../Middlewear/RateLimitation")
const AuthToken = require('../Middlewear/Auth')


const loginLimit = createRateLimiter("login",7,300)
const otpLimit = createRateLimiter("otp",5,300)
loginRoutes.post('/login',RateLimiterMiddleware(loginLimit),loginUser);
loginRoutes.post('/register',registerUser);
loginRoutes.post('/otpValidate',RateLimiterMiddleware(otpLimit),checkOtp);
loginRoutes.post('/refreshSession',tokenRefresh);
loginRoutes.put('/resetPassword',resetPassword);
loginRoutes.post('/checkUserExist',checkUserExist);
loginRoutes.post('/generateOtpResetPassword',generateOtpResetPassword);
loginRoutes.get('/userValidation',AuthToken,UserVerfication);
loginRoutes.get('/logout',AuthToken,handelLogout) 

module.exports = loginRoutes; 