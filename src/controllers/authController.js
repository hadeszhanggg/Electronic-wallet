const bcrypt = require('bcrypt');
const db = require('../models');
const { generateToken } = require('../services/jwtRefresh');
module.exports = {
    signup: async (req, res) => {
        try {
            const { username, password, email } = req.body;

            // Kiểm tra xem người dùng đã tồn tại hay chưa
            const existingUser = await db.user.findOne({
                where: {
                    username: username,
                },
            });

            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            // Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);

            // Tạo người dùng mới
            const newUser = await db.user.create({
                username: username,
                password: hashedPassword,
                email: email,
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

            // Tạo và trả về JWT
            const user = {
                id: newUser.id,
                username: newUser.username,
            };

            const token = generateToken(user);
            res.json({ token, refreshToken });
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
    login: async (req, res) => {
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

            // Kiểm tra xem người dùng có refreshToken hay không
            const refreshToken = await db.refreshToken.findOne({
                where: {
                    userId: user.id,
                },
            });

            // Tạo và trả về JWT
            const userData = {
                id: user.id,
                username: user.username,
            };

            let token;

            if (refreshToken) {
                // Nếu có refreshToken, sử dụng nó để tạo lại token
                token = generateToken(userData, refreshToken.token);
            } else {
                // Nếu không có refreshToken, tạo mới token
                token = generateToken(userData);
            }
            res.status(200).send({
                message: "Welcome to server!",
                id: user.id,
                username: user.username,
               token: token
              });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
};
