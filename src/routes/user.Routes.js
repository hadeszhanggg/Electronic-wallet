const authJwt = require('../middleware/authJWT');
const bcrypt = require('bcrypt');
const db = require("../models");
const controllers = require('../controllers/user.Controllers');
const { checkBillInfo,checkVouchersInfo } = require('../middleware/checkInforBill')
const logging=require('../middleware/logging');
const { add } = require('winston');
module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'Authorization, x-access-token, Origin, Content-Type, Accept',
        );
        next();
    });
     //Route lấy tất cả bills của user dựa trên accessToken của user
    app.get('/users/getAllBills', authJwt.authenticateToken,  authJwt.logUserInfo, async (req, res) => {
        try {
            await controllers.getAllBills(req,res);
            logging.info(`get all bills successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`) 
        } catch (error) {
            logging.error(`get all bills failed with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/getAllBills`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
    //Route lấy tất cả vouchers của user dựa trên accessToken của user 
    app.get('/users/getAllVouchers', authJwt.authenticateToken,  authJwt.logUserInfo, async (req, res) => {
        try {
            await controllers.getAllVouchers(req,res);
            logging.info(`get all vouchers successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`) 
        } catch (error) {
            logging.error(`get all vouchers failed with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/getAllBills`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
     //Route lấy danh sách các vouchers chưa sử dụng của user dựa trên accessToken của user
     app.get('/users/getUnusedVouchers', authJwt.authenticateToken,  authJwt.logUserInfo, async (req, res) => {
        try {
            await controllers.getUnusedVouchers(req,res);
            logging.info(`get unused voucher list successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`) 
        } catch (error) {
            logging.error(`get unused voucher list failed with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/getAllBills`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
         //Route lấy danh sách các vouchers chưa sử dụng theo loai của user dựa trên accessToken của user
         app.post('/users/getUnusedVouchersByType', authJwt.authenticateToken,  authJwt.logUserInfo, async (req, res) => {
            try {
                await controllers.getUnusedVouchersByType(req,res);
                logging.info(`get unused voucher list successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`) 
            } catch (error) {
                logging.error(`get unused voucher list failed with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/getAllBills`);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
      //Route lấy danh sách các bills chưa thanh toán của user dựa trên accessToken của user
     app.get('/users/getUnpaidBills', authJwt.authenticateToken,  authJwt.logUserInfo, async (req, res) => {
        try {
            await controllers.getUnpaidBills(req,res);
            logging.info(`get unpaid bill list successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`) 
        } catch (error) {
            logging.error(`get unpaid bill list failed with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/getAllBills`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
    app.post('/users/transferMoney', authJwt.authenticateToken,  authJwt.logUserInfo, async (req, res) => {
        try {
            await controllers.transferMoney(req,res);
            logging.info(`transfer money from ${req.userId} to ${req.body.recipientUsernameOrEmail} successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`) 
        } catch (error) {
            logging.error(`transfer money from ${req.userId} to ${req.body.recipientUsernameOrEmail}. from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/getAllBills`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }); 
    app.get('/users/getWallet', authJwt.authenticateToken,  authJwt.logUserInfo, async (req, res) => {
        try {
            await controllers.getWallet(req,res);
            logging.info(`get unpaid bill list successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`) 
        } catch (error) {
            logging.error(`get unpaid bill list failed with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/getAllBills`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
    //Đăng ký gói tiết kiệm
    app.post('/users/passbookRegistration', authJwt.authenticateToken, authJwt.logUserInfo, async (req, res) => {
        try {
            await controllers.createPassbookRegistration(req, res);
            logging.info(`Created passbook registration successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`);
        } catch (error) {
            logging.error(`Failed to create passbook registration with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/passbookRegistration`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
    app.get('/users/getAllPassbook', async (req, res) => {
        try {
            await controllers.getAllPassbook(req,res);
            logging.info(`get all passbook successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`) 
        } catch (error) {
            logging.error(`get all passbook failed with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/getAllBills`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
    app.post('/users/payBill', authJwt.authenticateToken, authJwt.logUserInfo, async (req, res) => {
        try {
            await controllers.payBill(req,res);
            logging.info(`Pay the bill successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`);
        } catch (error) {
            logging.error(`Failed to pay the bill with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/passbookRegistration`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
         //Route lấy tất cả bills của user dựa trên accessToken của user
         app.get('/users/getAllTransactions', authJwt.authenticateToken,  authJwt.logUserInfo, async (req, res) => {
            try {
                await controllers.getAllTransactions(req,res);
                logging.info(`get all transactions successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`) 
            } catch (error) {
                logging.error(`get all transactions failed with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/getAllBills`);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
        //Route lấy toàn bộ user
        app.get('/users/getAllUser', authJwt.authenticateToken, async (req, res) => {
            try {
                await controllers.getAllUsers(req,res);
                logging.info(`get all user successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`) 
            } catch (error) {
                logging.error(`get all user failed with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/getAllBills`);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
        //Add friend
        app.post('/users/addFriend', authJwt.authenticateToken, authJwt.logUserInfo, async (req, res) => {
            try {
                await controllers.addFriend(req, res);
                logging.info(`Add friend successfully for user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`);
            } catch (error) {
                logging.error(`Failed to add friend with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/addFriend`);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
        app.get('/users/getAllFriends', authJwt.authenticateToken, authJwt.logUserInfo, async (req, res) => {
            try {
                await controllers.getAllFriend(req, res);
                logging.info(`Get all friends successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`);
            } catch (error) {
                logging.error(`Get all friends failed with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/getAllFriends`);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
        app.get('/users/getUnconfirmedFriends', authJwt.authenticateToken, authJwt.logUserInfo, async (req, res) => {
            try {
                await controllers.getUnconfirmedFriends(req,res);
                logging.info(`Get unconfirmed friends successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`);
            } catch (error) {
                logging.error(`Get unconfirmed friends failed with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/getAllFriends`);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
         //Route cho phép user sửa thông tin của chính mình.
        app.put('/users/updateUser', authJwt.authenticateToken, authJwt.logUserInfo, async (req, res) => {
            try {
                    const userId = req.userId;
                    const { username, password, email, address, gender, date_of_birth, avatar } = req.body;
                    const hashedPassword = await bcrypt.hash(password, 10);
                    // Cập nhật thông tin người dùng trong cơ sở dữ liệu
                    const updatedUser = await db.user.update({ username, hashedPassword, address,email, gender, date_of_birth , avatar}, { where: { id: userId } });
                    if (updatedUser[0] === 1) {
                        return res.status(200).json({ message: 'User information updated successfully' });
                    } else {
                        return res.status(500).json({ message: 'Failed to update user information' });
                    }
                
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        });   
        app.post('/users/confirmFriend', authJwt.authenticateToken, authJwt.logUserInfo, async (req, res) => {
            try {
                if (!req.body.friendId) {
                    return res.status(400).json({ message: "friendId is required" });
                }
                await controllers.confirmAddFriend(req,res);
                logging.info(`Get unconfirmed friends successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`);
            } catch (error) {
                logging.error(`Get unconfirmed friends failed with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/getAllFriends`);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
};