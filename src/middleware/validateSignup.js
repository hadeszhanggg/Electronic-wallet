const db = require('../models');
const validateSignup = async (req, res, next) => {
  const { username, password, email, address, gender, date_of_birth } = req.body;

  // Kiểm tra không được thiếu trường dữ liệu
  if (!username || !password || !email || !address || typeof gender === 'undefined' || !date_of_birth) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Kiểm tra độ khó của mật khẩu (độ dài ít nhất 6 ký tự, có ít nhất một chữ hoa, một chữ thường, một số)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&.,;]{6,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number' });
  }

  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }



  try {
    // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu hay chưa
    const existingUser = await db.user.findOne({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }
    // Nếu tất cả kiểm tra đều thành công, chuyển sang middleware tiếp theo hoặc controller
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = validateSignup;