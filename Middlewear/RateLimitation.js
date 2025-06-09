const  redisDb = require('../redisConnect');
const {RateLimiterRedis} = require("rate-limiter-flexible");

const createRateLimiter = (keyPrefix,maxAttempt,duration)=>{

return new RateLimiterRedis({
    storeClient: redisDb,
    keyPrefix,
    points: maxAttempt,
    duration:duration,
    blockDuration:900
})

};

const RateLimiterMiddleware = (limiter) =>{

    return async (req,resp,next) =>{
        const userKey = req.body.username || req.ip;
        try {
            
            await limiter.consume(userKey);
            next();

        } catch (error) {
            console.log("Max Limit exceed", error)
            resp.status(429).json({ message: "Too many requests. Try again later." });
        }

    }
}


module.exports ={RateLimiterMiddleware,createRateLimiter};