const generateToken = require('../services/jwtRefresh');
app.post('/login', (req, res) => {
    // Xác thực người dùng, kiểm tra mật khẩu, vv.
    // Nếu xác thực thành công, tạo và trả về JWT
    const user = {
        id: req.userID,
        username: req.userName,
    };

    const token = generateToken(user);

    res.json({ token });
});