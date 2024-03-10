const {secret, jwtExpiration, jwtRefreshExpiration} = require("../configs/authConfig");
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: Token not provided' });
    }
    const secretKey = secret; 
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden: Invalid token' });
        }
        req.user = user;
        next();
    });
}
module.exports = {authenticateToken};