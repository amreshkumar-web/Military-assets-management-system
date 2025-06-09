const clearCookies = (resp) => {
    resp.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
    });
    resp.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
    });
    resp.clearCookie('XSRF-TOKEN',{
        httpOnly:true,
        secure:false,
        sameSite:"Lax"
    })
};

module.exports = clearCookies;