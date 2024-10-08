const bcrypt = require('bcrypt');
const db = require('../models');
const config=require("../configs/authConfig");
const validateSignup = require('../middleware/validateSignup');
const RefreshToken = db.refreshToken;
const jwt = require("jsonwebtoken");
const requestIp = require('request-ip');
const logging=require('../middleware/logging');
const ipFailures = {};
          // Function resets consecutiveLoginFailures variable to 0 for each IP address
          function resetConsecutiveFailures(ip) {
            ipFailures[ip] = 0;
          }
          // Perform a reset for each IP address every 60 minutes (60 * 60 * 1000 ms)
          setInterval(() => {
            for (const ip in ipFailures) {
              if (ipFailures.hasOwnProperty(ip)) {
                resetConsecutiveFailures(ip);
              }
            }
          }, 60 *1000);
module.exports = {
    signup: async (req, res) => {
        try {
          console.log(req.rawHeaders);
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
              avatar: "default",
              date_of_birth: parseDate(date_of_birth),
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

            logging.info(`Create new account succesfully with ${user}`);
            res.json({ message: "Signup new account succesfully!" });
          });
        } catch (error) {
          console.error(error);
          logging.error(`Create new account failed!`);
          // Thêm kiểm tra để tránh tạo người dùng mới nếu có lỗi
          if (error.name !== 'SequelizeDatabaseError') {
            logging.error(`Internal Server Error!`);
            res.status(500).json({ message: 'Internal Server Error' });
          } else {
            logging.error(`Internal Server Error!`);
            // Xử lý các lỗi khác nếu cần
            res.status(500).json({ message: 'Unknown Error' });
          }
        }
      },

      signin: async (req, res) => {
        try {
            const clientIp = requestIp.getClientIp(req);
            const consecutiveLoginFailures = ipFailures[clientIp] || 0;

            if (!req.body.username || !req.body.password) {
                return res.status(400).json({ message: 'Username or password cannot be empty' });
            }

            const { username, password } = req.body;

            if (consecutiveLoginFailures >= 5) {
                // Record a warning if the IP address has more than 5 failed login attempts
                logging.error(`Possible brute-force attack from IP address: [${clientIp}], codeLocation: [signin] function in auth.Controllers.js`);
                return res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
            }

            // Kiểm tra xem người dùng tồn tại hay không
            const user = await db.user.findOne({
                where: {
                    username: username,
                },
            });

            if (!user) {
                logging.warn(`Login error, cannot find account name or email with username: [${username}]`);
                ipFailures[clientIp] = (ipFailures[clientIp] || 0) + 1;
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            // Kiểm tra mật khẩu
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                ipFailures[clientIp] = (ipFailures[clientIp] || 0) + 1;
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            const wallet = await db.wallet.findOne({
                where: {
                    userId: user.id,
                },
            });

            const token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: config.jwtExp,
            });

            let refreshToken = await RefreshToken.createToken(user);
            let authorities = [];

            // Reset Consecutive Login Failures on successful login
            resetConsecutiveFailures(clientIp);

            const roles = await user.getRoles();
            for (let i = 0; i < roles.length; i++) {
                authorities.push("ROLE_" + roles[i].name.toUpperCase());
            }
            res.status(200).send({
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                roles: authorities,
                accessToken: token,
                refreshToken: refreshToken,
                is_active: user.is_active,
                address: user.address,
                gender: user.gender,
                date_of_birth: user.date_of_birth,
                wallet_id: wallet.id,
                prestige_score: wallet.prestige_score,
                account_balance: wallet.account_balance,
            });

            logging.info(`Successfully accessed by user ID: [${user.id}] with email: [${user.email}], IP address: [${clientIp}]`);
        } catch (error) {
            logging.error(`Login failed: ${error.message}, input username: [${req.body.username}], codeLocation: [signin] function in controllers/auth.controllers.js`);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    forgotPassword: async (req, res) => {
      try {
        const { username, password, email, address, gender, date_of_birth } = req.body;
        const user = await db.user.findOne({
          where: {
            email: email,
            username: username
          },
        });
        const dateOfBirth = parseDate(date_of_birth);
        if (user.email === email && user.username === username && user.address === address && user.gender === gender) {
          const hashedPassword = await bcrypt.hash(password, 10);
          // Cập nhật thông tin người dùng trong cơ sở dữ liệu
          const updatedUser = await db.user.update({ password: hashedPassword }, { where: { id: user.id } });
          if (updatedUser[0] === 1) {
            return res.status(200).json({ message: 'New password updated successfully' });
          } else {
            return res.status(500).json({ message: 'Failed to update new password for user!' });
          }
        } else {
          return res.status(401).json({ message: 'The information you provided is not accurate!' });
        }
      } catch (err) {
        logging.error(`Error: [${err.message}], IP address: [${requestIp.getClientIp(req)}], User ID: [${req.userId}], email: [${req.userEmail}], codeLocation: [forgotPassword] function in authController.js`);
        return res.status(500).send({ message: "error!" });
      }
    }
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
function parseDate(dateString) {
  // Phân tách chuỗi ngày tháng thành mảng
  var parts = dateString.split('/');
  // Lấy các thành phần của ngày tháng năm
  var day = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10) - 1; // Trừ đi 1 vì tháng trong JavaScript bắt đầu từ 0
  var year = parseInt(parts[2], 10);
  // Tạo đối tượng Date từ các thành phần trên
  return new Date(year, month, day);
}