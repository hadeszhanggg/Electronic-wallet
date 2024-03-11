// middlewares/checkInfoBill.js
const { wallet } = require('../models');

const checkBillInfo = async (req, res, next) => {
    const { description, total, wallet_id } = req.body;
    try {
        // Kiểm tra ví có tồn tại không
        const walletInstance = await wallet.findByPk(wallet_id);
        if (!walletInstance) {
            return res.status(404).json({ message: 'Wallet not found.' });
        }
        if(!description||!isValidDouble(total)||!isValidInteger(wallet_id))
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
const checkVouchersInfo = async (req, res, next) => {
    const { voucher_name, description, discount,expiry, wallet_id } = req.body;
    try {
        // Kiểm tra ví có tồn tại không
        const walletInstance = await wallet.findByPk(wallet_id);
        if (!walletInstance) {
            return res.status(404).json({ message: 'Wallet not found.' });
        }
        if(!voucher_name||!description||!isValidDouble(discount)||!isValidInteger(wallet_id)||isValidInteger(expiry))
        // Lưu ví vào req để sử dụng sau này
        req.walletInstance = walletInstance;

        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
module.exports = { checkBillInfo, checkVouchersInfo };
