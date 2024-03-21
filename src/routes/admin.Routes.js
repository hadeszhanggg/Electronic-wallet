const authJwt = require('../middleware/authJWT');
const { CreateBill,CreateVoucher } = require('../controllers/admin.Controllers');
const { checkBillInfo,checkVouchersInfo } = require('../middleware/checkInforBill')
const logging=require('../middleware/logging');
module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'Authorization, x-access-token, Origin, Content-Type, Accept'
        );
        next();
    });
    //route tạo bill cho admin 
    app.post('/admin/bill/createBill',[authJwt.authenticateToken, checkBillInfo],  authJwt.logUserInfo, async (req, res) => {
        try {
            if (await authJwt.isAdmin(req)) {
                await CreateBill(req, res);
                return;
            } else 
            logging.error(`Use api create bill failed because 'access denined', Client IP: [${req.clientIp}], from routes: /admin/bill/createBill`);
                res.status(403).json({ message: "Access denied!" });       
        } catch (error) {
            logging.error(`Use api create bill failed because 'Server error', Client IP: [${req.clientIp}], from routes: /admin/bill/createBill`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
    // Route tạo voucher mới cho admin 
    app.post('/admin/voucher/createVoucher', [authJwt.authenticateToken, checkVouchersInfo],  authJwt.logUserInfo, async (req, res) => {
        try {
            if (await authJwt.isAdmin(req)) {
                await CreateVoucher(req, res);
                return;
            } else 
            logging.error(`Use api create voucher failed because 'access denined', Client IP: [${req.clientIp}], from routes: /admin/voucher/createVoucher`);
                res.status(403).json({ message: "Access denied!" });       
        } catch (error) {
            logging.error(`Use api create voucher failed because 'access denined', Client IP: [${req.clientIp}], from routes: /admin/voucher/createVoucher`);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
};
