// routes/admin.routes.js
const { generateToken } = require('../services/jwtRefresh');
const authJwt = require('../middleware/authJWT');
const { CreateBill } = require('../controllers/bill.Controllers');
const { checkBillInfo } = require('../middleware/checkInforBill');

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            'Access-Control-Allow-Headers',
            'Authorization, x-access-token, Origin, Content-Type, Accept'
        );
        next();
    });

    // Sử dụng middleware authJWT chỉ ở những tuyến đường yêu cầu xác thực
    app.post('/admin/bill/createBill', [authJwt.authenticateToken, checkBillInfo], async (req, res) => {
        try {
            if (await authJwt.isAdmin(req)) {
                await CreateBill(req, res);
                return;
            } else 
                res.status(403).json({ message: "Access denied!" });       
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
};
