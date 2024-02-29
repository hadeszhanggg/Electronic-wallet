const {generateToken }= require('../services/jwtRefresh');
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Authorization, x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

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
};