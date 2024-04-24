const authJwt = require('../middleware/authJWT');
const { CreateBill,CreateVoucher } = require('../controllers/admin.Controllers');
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
    //Route cho phép admin xóa user khỏi hệ thống.
    app.delete('/admin/deleteUser/:id', authJwt.authenticateToken, authJwt.logUserInfo, async (req, res) => {
        try {
            if (await authJwt.isAdmin(req)) {
                const userId = req.body.userId;
                // Kiểm tra người dùng có tồn tại không
                const existingUser = await db.user.findByPk(userId);
                if (!existingUser) {
                    return res.status(404).json({ message: 'User not found' });
                }
                // Xóa người dùng từ cơ sở dữ liệu
                const deletedUser = await db.user.destroy({ where: { id: userId } });
                if (deletedUser === 1) {
                    return res.status(200).json({ message: 'User deleted successfully' });
                } else {
                    return res.status(500).json({ message: 'Failed to delete user' });
                }
            } else {
                logging.error(`Access denied to deleteUser API by admin ${req.userId}, email: ${req.userEmail}, client IP: ${req.clientIp}`);
                return res.status(403).json({ message: "Access denied!" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });    
    //Route cho phép admin sửa thông tin user.
    app.put('/admin/updateUser/:id', authJwt.authenticateToken, authJwt.logUserInfo, async (req, res) => {
        try {
            if (await authJwt.isAdmin(req)) {
                const userId = req.body.userId;
                const { username, password, email, address, gender, date_of_birth } = req.body;
                
                // Kiểm tra người dùng có tồn tại không
                const existingUser = await db.user.findByPk(userId);
                if (!existingUser) {
                    return res.status(404).json({ message: 'User not found' });
                }
                // Cập nhật thông tin người dùng trong cơ sở dữ liệu
                const updatedUser = await db.user.update({ username, password, email, address, gender, date_of_birth }, { where: { id: userId } });
                if (updatedUser[0] === 1) {
                    return res.status(200).json({ message: 'User information updated successfully' });
                } else {
                    return res.status(500).json({ message: 'Failed to update user information' });
                }
            } else {
                logging.error(`Access denied to editUser API by admin ${req.userId}, email: ${req.userEmail}, client IP: ${req.clientIp}`);
                return res.status(403).json({ message: "Access denied!" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    });    
};
