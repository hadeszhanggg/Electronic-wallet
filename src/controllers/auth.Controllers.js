const bcrypt = require('bcrypt');
const db = require('../models');
const config=require("../configs/authConfig");
const validateSignup = require('../middleware/validateSignup');
const RefreshToken = db.refreshToken;
const jwt = require("jsonwebtoken");
module.exports = {
    signup: async (req, res) => {
        try {
          // Sử dụng middleware kiểm tra ràng buộc
          validateSignup(req, res, async () => {
            const { username, password, email, address, gender, date_of_birth } = req.body;
    
            // Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Tạo người dùng mới
            const newUser = await db.user.create({
              username: username,
              password: hashedPassword,
              email: email,
              address: address,
              gender: gender,
              date_of_birth: date_of_birth,
            });
    
            // Gán vai trò mặc định (role_id = 1)
            const defaultRole = await db.role.findOne({
              where: {
                id: 1, // ID của vai trò mặc định
              },
            });
    
            await newUser.addRole(defaultRole);
    
            // Tạo refreshToken
            const refreshToken = await db.refreshToken.createToken(newUser);
            const createWallet = await db.wallet.createWallet(newUser);
            // Tạo và trả về JWT
            const user = {
              id: newUser.id,
              username: newUser.username,
              email: newUser.email,
              address: newUser.address,
              date_of_birth: newUser.date_of_birth,          
            };
    

            res.json({ message: "Signup new account succesfully!" });
          });
        } catch (error) {
          console.error(error);
    
          // Thêm kiểm tra để tránh tạo người dùng mới nếu có lỗi
          if (error.name !== 'SequelizeDatabaseError') {
            res.status(500).json({ message: 'Internal Server Error' });
          } else {
            // Xử lý các lỗi khác nếu cần
            res.status(500).json({ message: 'Unknown Error' });
          }
        }
      },
    signin: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Kiểm tra xem người dùng tồn tại hay không
            const user = await db.user.findOne({
                where: {
                    username: username,
                },
            });

            if (!user) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            // Kiểm tra mật khẩu
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }
            const token = jwt.sign({ id: user.id }, config.secret, {
              expiresIn: config.jwtExp,
            });
            let refreshToken = await RefreshToken.createToken(user);
            let authorities = [];
            user.getRoles().then(roles => {
              for (let i = 0; i < roles.length; i++) {
                authorities.push("ROLE_" + roles[i].name.toUpperCase());
              }
              res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                roles: authorities,
                accessToken: token,
                refreshToken: refreshToken,
                is_active: user.is_active
              });
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
};
exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;
  const userId = req.userId;
  const userEmail = req.userEmail;
  var clientIp = requestIp.getClientIp(req);
  if (requestToken == null) {
    logger.log('warn',`Error occurred during token refresh, IP address: [${clientIp}], User ID: [${userId}], email: [${userEmail}], codeLocation: [refreshToken] function in controllers/authController.js` );
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({ where: { token: requestToken } });

    if (!refreshToken) {
      logger.log('warn',`Refresh token is not in database!, IP address: [${clientIp}], User ID: [${userId}], email: [${userEmail}], codeLocation: [refreshToken] function in controllers/authController.js` );
      res.status(403).json({ message: "Error!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.destroy({ where: { id: refreshToken.id } });
      logger.log('warn',`Refresh token was expired. Please make a new login request, IP address: [${clientIp}], User ID: [${userId}], email: [${userEmail}], codeLocation: [refreshToken] function in controllers/authController.js` );
      res.status(403).json({
        message: "Error!",
      });
      return;
    }

    const user = await refreshToken.getUser();
    let newAccessToken = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });
    logger.log('info',`Token verification successful, IP address: [${clientIp}], User ID: [${userId}], email: [${userEmail}]` );
    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    logger.log('error',`Error: [${err.message}], IP address: [${clientIp}], User ID: [${userId}], email: [${userEmail}], codeLocation: [refreshToken] function in controllers/authController.js` );
    return res.status(500).send({ message: "error!"});
  }
};