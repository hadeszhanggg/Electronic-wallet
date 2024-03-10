// middlewares/checkInfoBill.js
const { wallet } = require('../models');

const checkBillInfo = async (req, res, next) => {
    const { description, total, expiryDays, wallet_id } = req.body;
    try {
        // Kiểm tra ví có tồn tại không
        const walletInstance = await wallet.findByPk(wallet_id);
        if (!walletInstance) {
            return res.status(404).json({ message: 'Wallet not found.' });
        }

        // Lưu ví vào req để sử dụng sau này
        req.walletInstance = walletInstance;

        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Hàm kiểm tra kiểu dữ liệu là số thực
const isValidDouble = (value) => {
    return typeof value === 'number' && !isNaN(value);
};

// Hàm kiểm tra kiểu dữ liệu là số nguyên
const isValidInteger = (value) => {
    return Number.isInteger(Number(value));
};

module.exports = { checkBillInfo };
