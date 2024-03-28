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
        
        // Lấy thông tin của người đang thực hiện chuyển tiền
        const sender = await db.user.findByPk(senderId);
        if (!sender) {
            return res.status(404).send({ message: "Sender not found" });
        }
        
        // Kiểm tra xem recipientUsernameOrEmail có phải là email hoặc username của người đang thực hiện chuyển tiền hay không
        if (recipientUsernameOrEmail === sender.email || recipientUsernameOrEmail === sender.username) {
            return res.status(400).send({ message: "Cannot transfer money to yourself" });
        }

        // Kiểm tra xem người nhận có tồn tại không
        const recipient = await db.user.findOne({
            where: {
                [db.Sequelize.Op.or]: [{ username: recipientUsernameOrEmail }, { email: recipientUsernameOrEmail }]
            }
        });
       
        if (!recipient) {
            return res.status(404).send({ message: "Recipient not found" });
        }

        // Lấy thông tin ví của người gửi
        const senderWallet = await db.wallet.findOne({ where: { userId: senderId } });
        if (!senderWallet) {
            return res.status(404).send({ message: "Sender wallet not found" });
        }
        // Kiểm tra số dư trong ví của người gửi
        if (senderWallet.account_balance < amount) {
            return res.status(400).send({ message: "Insufficient balance" });
        }
        const Content =content+` Email user recipient is ${recipientUsernameOrEmail}`;
        // Trừ số tiền cần chuyển từ số dư trong ví của người gửi
        senderWallet.account_balance -= amount;
        await senderWallet.save();

        // Cộng số tiền vào số dư của ví của người nhận
        const recipientWallet = await db.wallet.findOne({ where: { userId: recipient.id } });
        if (!recipientWallet) {
            return res.status(404).send({ message: "Recipient wallet not found" });
        }
        recipientWallet.account_balance += amount;
        await recipientWallet.save();

        const newTransactionHistory = await db.transactionHistory.createTransactionHistory(senderWallet.id, 'transfer',Content,amount);

        return res.status(200).send(newTransactionHistory );
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
