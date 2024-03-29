const logging = require('../middleware/logging');
const db = require("../models");
const jwt = require("jsonwebtoken");
const moment = require('moment-timezone');
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
        logging.error(`Get unused voucher list failed with detail: [${error.message}], from user ID: [${req.userId}], email: [${req.userEmail}] and Client IP: [${req.clientIp}], from Controller: getUnusedVouchers.`);
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
        logging.error(`Get unused voucher list failed with detail: [${error.message}], from user ID: [${req.userId}], email: [${req.userEmail}] and Client IP: [${req.clientIp}], from Controller: getUnusedVouchers.`);
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
        logging.error(`Get unused voucher list failed with detail: [${error.message}], from user ID: [${req.userId}], email: [${req.userEmail}] and Client IP: [${req.clientIp}], from Controller: getUnusedVouchers.`);
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
        logging.error(`Get unused voucher list failed with detail: [${error.message}], from user ID: [${req.userId}], email: [${req.userEmail}] and Client IP: [${req.clientIp}], from Controller: getUnusedVouchers.`);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
exports.depositMoney = async (req, res) => {
    try {
        const userId = req.userId;
        const amount = req.body.amount; // Số tiền cần nạp, được gửi từ client

        // Kiểm tra số tiền cần nạp có hợp lệ không
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        // Tìm ví dựa trên userID
        const userWallet = await db.wallet.findOne({ where: { userId: userId } });

        if (!userWallet) {
            return res.status(404).send({ message: "User wallet not found" });
        }

        // Nạp tiền vào tài khoản
        const updatedWallet = await userWallet.increment('account_balance', { by: amount });

        return res.status(200).json({ message: "Deposit successful", updatedWallet });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
//Chuyển tiền giữa các user
exports.transferMoney = async (req, res) => {
    try {
        const { recipientUsernameOrEmail, content, amount } = req.body;
        const senderId = req.userId; 
        // Ép kiểu dữ liệu của số tiền thành số thực
        const transferAmount = parseFloat(amount);
        // Kiểm tra số tiền hợp lệ
        if (!transferAmount || isNaN(transferAmount) || transferAmount <= 0) {
            return res.status(400).json({ message: "Invalid transfer amount" });
        }
        // Lấy thông tin của người gửi
        const sender = await db.user.findByPk(senderId);
        if (!sender) {
            return res.status(404).send({ message: "Sender not found" });
        }
        // Kiểm tra xem recipientUsernameOrEmail có phải là người gửi hay không
        if (recipientUsernameOrEmail === sender.email || recipientUsernameOrEmail === sender.username) {
            return res.status(400).send({ message: "Cannot transfer money to yourself" });
        }
        // Lấy thông tin của người nhận
        const recipient = await db.user.findOne({
            where: {
                [db.Sequelize.Op.or]: [{ username: recipientUsernameOrEmail }, { email: recipientUsernameOrEmail }]
            }
        });
        if (!recipient) {
            return res.status(404).send({ message: "Recipient not found" });
        }
        // Lấy thông tin số dư ví của người gửi
        const senderWallet = await db.wallet.findOne({ where: { userId: senderId } });
        if (!senderWallet) {
            return res.status(404).send({ message: "Sender wallet not found" });
        }
        // Kiểm tra số dư ví có đủ để chuyển hay không
        if (senderWallet.account_balance < transferAmount) {
            return res.status(400).send({ message: "Insufficient balance" });
        }
        // Trừ số tiền từ số dư ví của người gửi
        await senderWallet.decrement('account_balance', { by: transferAmount });
        // Cộng số tiền vào số dư ví của người nhận
        const recipientWallet = await db.wallet.findOne({ where: { userId: recipient.id } });
        if (!recipientWallet) {
            return res.status(404).send({ message: "Recipient wallet not found" });
        } 
        await recipientWallet.increment('account_balance', { by: transferAmount });
        // Tạo bản ghi lịch sử giao dịch
        const transactionContent = content + ` Email user recipient is ${recipientUsernameOrEmail}`;
        const newTransactionHistory = await db.transactionHistory.createTransactionHistory(senderWallet.id, 2, transactionContent, transferAmount);
        return res.status(200).send(newTransactionHistory);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
