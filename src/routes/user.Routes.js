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
    app.get('/users/getAllBills', authJwt.authenticateToken,  authJwt.logUserInfo, async (req, res) => {
        try {
            await controllers.getAllBillsByAccessToken(req,res);
            logging.info(`get all bills successfully from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}]`) 
        } catch (error) {
            logging.error(`get all bills failed with detail: [${error.message}] from user ID: [${req.userId}], email: [${req.userEmail}] and client IP: [${req.clientIp}], from routes: /users/getAllBills`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
};