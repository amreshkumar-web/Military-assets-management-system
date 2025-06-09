const bcrypt = require('bcryptjs');
const CsrfAuth = async (req,resp,next) =>{
    
    const hashedCsrfToken = req.cookies?.["XSRF-TOKEN"]; // CSRF token from cookies
    const csrfToken = req.headers["x-xsrf-token"]; // CSRF token from headers
    const clearCookies = require('../utils/ClearCookies')

    if(!hashedCsrfToken || !csrfToken){
        clearCookies(resp); 
        return resp.status(406).json({message:"Bad Request"});
    }
try {
    
const checkingToken = await bcrypt.compare(csrfToken,hashedCsrfToken);

if(!checkingToken){
    clearCookies(resp);
    return resp.status(406).json({message:"Bad Request"});
} 

next();

} catch (error) {
    console.log("Error in CSRF AUth", error);
    clearCookies(resp);
return resp.status(500).json({message:"Something went wrong"})
}

}

module.exports = CsrfAuth;