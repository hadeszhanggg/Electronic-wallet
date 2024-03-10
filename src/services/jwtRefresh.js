// jwtRefresh.js
const jwt = require('jsonwebtoken');
const config = require('../configs/authConfig');

module.exports = {
    generateToken: (user, refreshToken) => {
        const payload = {
            userId: user.id,
            username: user.username,
            email: user.email,
            address: user.address,
            date_of_birth: user.date_of_birth,
        };

        const options = {
            expiresIn: config.jwtExp,
        };

        if (refreshToken) {
            // Nếu có refreshToken, thêm nó vào options
            options.jwtid = refreshToken;
        }

        const secretKey = config.secret;

        const token = jwt.sign(payload, secretKey, options);
        return token;
    },
};
