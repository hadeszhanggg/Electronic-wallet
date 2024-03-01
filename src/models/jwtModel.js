const config = require("../configs/authConfig");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, Sequelize) => {
    const RefreshToken = sequelize.define("JWT", {
        token: {
            type: Sequelize.STRING,
        },
        expiryDate: {
            type: Sequelize.DATE, // Thay đổi kiểu dữ liệu thành Sequelize.DATE
        },
    });

    RefreshToken.createToken = async function (user) {
        let expiredAt = new Date();
        expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExp);

        // Sử dụng kiểu dữ liệu Sequelize.DATE để tránh lỗi "Invalid date"
        let refreshToken = await this.create({
            token: uuidv4(),
            userId: user.id,
            expiryDate: expiredAt, // Truyền trực tiếp đối tượng Date
        });

        return refreshToken.token;
    };

    RefreshToken.verifyExpiration = (token) => {
        return token.expiryDate.getTime() < new Date().getTime();
    };

    return RefreshToken;
};
