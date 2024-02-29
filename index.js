const express = require('express');
const app = express();

app.post('/login', (req, res) => {
    // Xác thực người dùng, kiểm tra mật khẩu, vv.
    // Nếu xác thực thành công, tạo và trả về JWT
    const user = {
        id: 1,
        username: 'exampleUser',
    };

    const token = generateToken(user);

    res.json({ token });
});

// Khởi chạy máy chủ
const port = proccess.env.SERVER_PORT;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
