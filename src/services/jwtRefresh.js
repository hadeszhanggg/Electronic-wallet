const jwt = require('jsonwebtoken');
const {secret, jwtExpiration, jwtRefreshExpiration} = require("../configs/authConfig");
function generateToken(user) {
    const payload = {
        userId: user.id,
        username: user.username,
    };

    const options = {
        expiresIn: jwtExpiration, 
    };

    const secretKey = secret; 

    const token = jwt.sign(payload, secretKey, options);
    return token;
}
module.exports= {generateToken}