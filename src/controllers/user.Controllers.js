const { where } = require('sequelize');
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
        attributes: ['id', 'description', 'total','type', 'paid', 'expiryDays', 'paid_date']
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
        attributes: ['id', 'voucher_name', 'type','description', 'discount', 'exp', 'used','used_date']
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
            attributes: ['id', 'description','type','total', 'expiryDays', 'paid_date']
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
        const transactionContent = content + `Email user recipient is ${recipientUsernameOrEmail}`;
        const newTransactionHistory = await db.transactionHistory.createTransactionHistory(senderWallet.id, 2, transactionContent, transferAmount);
        return res.status(200).send(newTransactionHistory);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
exports.getWallet = async (req, res) => {
    try {; 
        const userId=req.userId;
        // Tìm ví dựa trên userID
        const wallet = await db.wallet.findOne({
            where: {
                userId: userId,
            }, 
          });
        
        if (!wallet) {
            return res.status(404).send({ message: "User wallet not found" });
        }
        res.status(200).send({
            wallet_id: wallet.id,
            prestige_score: wallet.prestige_score,
            account_balance: wallet.account_balance,
          });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
/// API thêm một giao dịch sổ tiết kiệm
exports.createPassbookRegistration = async (req, res) => {
    try {
        const userId=req.userId;
        // Tìm ví dựa trên userID
        const wallet = await db.wallet.findOne({
            where: {
                userId: userId,
            }, 
          });
        const { amount_deposit, passbookId } = req.body;
        
        // Kiểm tra nếu walletId hoặc passbookId không được cung cấp
        if (!wallet || !passbookId || !amount_deposit) {
            return res.status(400).json({ message: "Wallet ID and Passbook ID or amount_deposit are required" });
        }

        // Kiểm tra nếu walletId hoặc passbookId không hợp lệ
        const passbook = await db.passbook.findByPk(passbookId);
        if (!wallet || !passbook) {
            return res.status(404).json({ message: "Wallet or Passbook not found" });
        }

        // Kiểm tra xem có đủ tiền trong tài khoản không
        if (wallet.account_balance < amount_deposit) {
            return res.status(400).json({ message: "Insufficient balance in the wallet" });
        }

        // Lấy thông tin về kỳ hạn (period) của passbook
        const period = passbook.period;

        // Tính toán ngày hết hạn (expire) cho đăng ký sổ tiết kiệm
        const currentDateTime = moment().tz('Asia/Ho_Chi_Minh');
        const expireDateTime = currentDateTime.add(period, 'months');

        // Tạo một bản ghi mới trong bảng wallets_passbooks
        const newPassbookRegistration = await db.wallets_passbooks.create({
            walletId: wallet.id,
            passbookId: passbookId,
            amount_deposit: amount_deposit,
            expire: expireDateTime.format('YYYY-MM-DD HH:mm:ss')
        });
        // Trừ số tiền amount_deposit từ account_balance
        const updatedBalance = wallet.account_balance - amount_deposit;
        await wallet.update({ account_balance: updatedBalance });
         // Tạo bản ghi lịch sử giao dịch
         const transactionContent = `Register passbook ${passbook.passbook_name}`;
         const newTransactionHistory = await db.transactionHistory.createTransactionHistory(wallet.id, 3, transactionContent, amount_deposit);
        return res.status(201).json(newPassbookRegistration);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
//Get all passbook
exports.getAllPassbook = async (req, res) => {
    try {
        const passbooks = await db.passbook.findAll({
            attributes: ['id', 'passbook_name', 'description', 'interest_rate', 'period']
        });
        return res.status(200).json(passbooks);
    } catch (error) {
       // logging.error(`Get unused voucher list failed with detail: [${error.message}], from user ID: [${req.userId}], email: [${req.userEmail}] and Client IP: [${req.clientIp}], from Controller: getUnusedVouchers.`);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
//Pay bill
exports.payBill = async (req, res) => {
    try {
        const userId=req.userId;
        const {billId}  = req.body;
        const wallet = await db.wallet.findOne({
            where: {
                userId: userId,
            }, 
          });
        const bill = await db.bill.findOne({
            where: {
                id: billId,
            }, 
          });
            if (wallet.account_balance < bill.total) {
                return res.status(400).send({ message: "Insufficient balance" });
            }
            const currentDateTime = moment().tz('Asia/Ho_Chi_Minh');
            bill.update({ paid: true, paid_date:  currentDateTime.format('YYYY-MM-DD HH:mm:ss')});
            // Trừ số tiền từ số dư ví của người gửi
            await wallet.decrement('account_balance', { by: bill.total });
             // Tạo bản ghi lịch sử giao dịch
            const transactionContent = `Pay bill ${bill.type}`;
            const newTransactionHistory = await db.transactionHistory.createTransactionHistory(wallet.id,3, transactionContent, bill.total);
            return res.status(200).json({message: "Pay the bill successfully"});
    } catch (error) {
       // logging.error(`Get unused voucher list failed with detail: [${error.message}], from user ID: [${req.userId}], email: [${req.userEmail}] and Client IP: [${req.clientIp}], from Controller: getUnusedVouchers.`);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
exports.getAllTransactions = async (req, res) => {
    try {
      const userId = req.userId;
      // tìm ví dựa trên userID 
      const userWallet = await db.wallet.findOne({ where: { userId: userId } });
      
      if (!userWallet) {
        return res.status(404).send({ message: "User wallet not found" });
      }
      const walletId = userWallet.id;
      // Lấy tất cả bills thuộc ví (walletId)
      const trans = await db.transactionHistory.findAll({ 
        where: { walletId: walletId },
        attributes: ['id', 'content','amount','date','tranTypeId']
    });
      return res.status(200).json(trans);
    } catch (error) {
        logging.error(`Get unused voucher list failed with detail: [${error.message}], from user ID: [${req.userId}], email: [${req.userEmail}] and Client IP: [${req.clientIp}], from Controller: getUnusedVouchers.`);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
//Get all user
exports.getAllUsers = async (req, res) => {
    try {
        const users = await db.user.findAll({
            attributes: ['id', 'username', 'email', 'address', 'avatar', 'gender', 'date_of_birth'],
            include: [{
                model: db.role,
                attributes: [],
                where: {
                    name: { [db.Sequelize.Op.ne]: 'admin' }
                }
            }]
        });
        return res.status(200).json(users);
    } catch (error) {
        logging.error(`Get all user failed with detail: [${error.message}], from user ID: [${req.userId}], email: [${req.userEmail}] and Client IP: [${req.clientIp}], from Controller: getAllUsers.`);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
exports.addFriend = async (req, res) => {
    try {
        const userId = req.userId;
        const { friendUsernameOrEmail } = req.body;

        // Tìm kiếm user bạn bè qua username hoặc email
        const friend = await db.user.findOne({
            where: {
                [db.Sequelize.Op.or]: [{ username: friendUsernameOrEmail }, { email: friendUsernameOrEmail }]
            },
            attributes: ['id', 'username', 'email']
        });

        if (!friend) {
            return res.status(404).json({ message: "Friend not found" });
        }

        if (userId === friend.id) {
            return res.status(400).json({ message: "Cannot add yourself as a friend" });
        }

        // Kiểm tra nếu tồn tại lời mời kết bạn từ friend đến user
        const existingFriendship = await db.friendship.findOne({
            where: {
                userId: friend.id,
                friendId: userId,
                isConfirmed: false
            }
        });

        if (existingFriendship) {
            // Cập nhật trạng thái lời mời kết bạn thành 'confirmed'
            await existingFriendship.update({ isConfirmed: true });
            return res.status(200).json({ message: `Friend request confirmed with ${friend.username}` });
        }

        let friendship;
        let created;
        try {
            // Thử tạo mối quan hệ bạn bè mới
            [friendship, created] = await db.friendship.findOrCreate({
                where: {
                    userId: Math.min(userId, friend.id),
                    friendId: Math.max(userId, friend.id)
                },
                defaults: {
                    userId: userId,
                    friendId: friend.id,
                    isConfirmed: false
                }
            });
        } catch (findOrCreateError) {
            console.error("findOrCreate Error:", findOrCreateError);
            return res.status(500).json({ message: "Error creating friendship" });
        }

        if (!created && friendship.isConfirmed === true) {
            return res.status(400).json({ message: "Already friends" });
        }

        if (!created) {
            await friendship.update({ isConfirmed: false });
        }

        return res.status(200).json({ message: `Friend request sent to ${friend.username}` });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAllFriend = async (req, res) => {
    try {
        const userId = req.userId;
        const friendships = await db.friendship.findAll({
            where: {
                [db.Sequelize.Op.or]: [{ userId }, { friendId: userId }],
                isConfirmed: true
            }
        });

        const friendIds = friendships.map(f => (f.userId === userId ? f.friendId : f.userId));
        
        const friends = await db.user.findAll({
            where: { id: friendIds },
            attributes: ['id', 'username', 'email', 'address', 'avatar', 'gender', 'date_of_birth']
        });

        return res.status(200).json(friends);
    } catch (error) {
        console.error(`Get friends list failed: ${error.message}`);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.getUnconfirmedFriends = async (req, res) => {
    try {
        const userId = req.userId;
        const friendRequests = await db.friendship.findAll({
            where: {
                friendId: userId,
                isConfirmed: false
            }
        });

        const requesters = await db.user.findAll({
            where: {
                id: friendRequests.map(req => req.userId)
            },
            attributes: ['id', 'username', 'email', 'address', 'avatar', 'gender', 'date_of_birth']
        });

        return res.status(200).json(requesters);
    } catch (error) {
        console.error(`Get unconfirmed friends list failed: ${error.message}`);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.confirmAddFriend = async (req, res) => {
    try {
        const userId = req.userId;
        const { request, friendId } = req.body;
        if (request === "refuse") {
            const friendship = await db.friendship.findOne({
                where: {
                    userId: friendId,
                    friendId: userId,
                    isConfirmed: false
                }
            });
            if (!friendship) {
                return res.status(404).send({ message: "Friend request not found" });
            }
            await friendship.destroy();

            return res.status(200).json({ message: "Friend request refused and removed" });
        } else {
            const friendship = await db.friendship.findOne({
                where: {
                    userId: friendId,
                    friendId: userId,
                    isConfirmed: false
                }
            });

            if (!friendship) {
                return res.status(404).send({ message: "Friend request not found" });
            }

            await friendship.update({ isConfirmed: true });

            return res.status(200).json({ message: "Friend request confirmed" });
        }
    } catch (error) {
        console.error(`Confirm friend request failed: ${error.message}`);
        return res.status(500).send({ message: "Internal Server Error" });
    }
};
