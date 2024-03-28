const logging = require('../middleware/logging');
const db = require("../models");
const jwt = require("jsonwebtoken");
// Controller để xử lý sự kiện "welcomeMessage" cho socket.io
exports.handleWelcomeMessage=async(req,res)=> {
    console.log('Received welcome message:', message);
};

exports.getAllBills = async (req, res) => {
    try {
      const userId = req.userId;
      // tìm ví dựa trên userID 
      const userWallet = await db.wallet.findOne({ where: { userId: userId } });
      
      if (!userWallet) {
        return res.status(404).send({ message: "User wallet not found" });
      }
  
      const walletId = userWallet.id;
  
      // Lấy tất cả bills thuộc ví (walletId)
      const bills = await db.bill.findAll({ 
        where: { walletId: walletId },
        attributes: ['id', 'description', 'total', 'paid', 'expiryDays', 'paid_date']
    });
  
      return res.status(200).json(bills);
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
};
exports.getAllVouchers = async (req, res) => {
    try {
      const userId = req.userId;
      // tìm ví dựa trên userID 
      const userWallet = await db.wallet.findOne({ where: { userId: userId } });
      
      if (!userWallet) {
        return res.status(404).send({ message: "User wallet not found" });
      }
  
      const walletId = userWallet.id;
  
      // Lấy tất cả vouchers thuộc ví (walletId)
     // const vouchers = await db.voucher.findAll({ where: { walletId: walletId } });
      const vouchers = await db.voucher.findAll({ 
        where: { walletId: walletId },
        attributes: ['id', 'voucher_name', 'description', 'discount', 'exp', 'used','used_date']
    });
      return res.status(200).json(vouchers);
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).send({ message: "Internal Server Error" });
    }
};
exports.getUnpaidBills = async (req, res) => {
    try {
        const userId = req.userId;
        // Tìm ví dựa trên userID
        const userWallet = await db.wallet.findOne({ where: { userId: userId } });
        if (!userWallet) {
            return res.status(404).send({ message: "User wallet not found" });
        }
        const walletId = userWallet.id;
        // Lấy tất cả các hóa đơn chưa thanh toán thuộc ví (walletId)
        const unpaidBills = await db.bill.findAll({
            where: { walletId: walletId, paid: false },
            attributes: ['id', 'description', 'total', 'expiryDays', 'paid_date']
        });
        return res.status(200).json(unpaidBills);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.getUnusedVouchers = async (req, res) => {
    try {
        const userId = req.userId;
        // Tìm ví dựa trên userID
        const userWallet = await db.wallet.findOne({ where: { userId: userId } });

        if (!userWallet) {
            return res.status(404).send({ message: "User wallet not found" });
        }
        const walletId = userWallet.id;
        // Lấy tất cả các voucher chưa sử dụng thuộc ví (walletId)
        const unusedVouchers = await db.voucher.findAll({
            where: { walletId: walletId, used: false },
            attributes: ['id', 'voucher_name', 'description', 'discount', 'exp']
        });
        return res.status(200).json(unusedVouchers);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
