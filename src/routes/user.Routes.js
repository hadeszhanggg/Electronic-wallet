const authJwt = require('../middleware/authJWT');
const controllers = require('../controllers/user.Controllers');
const { checkBillInfo,checkVouchersInfo } = require('../middleware/checkInforBill')
const logging=require('../middleware/logging');
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
};