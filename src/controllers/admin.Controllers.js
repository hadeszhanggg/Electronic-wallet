// controllers/bill.controllers.js
const { bill,voucher } = require('../models');
const logging = require('../middleware/logging');
//hàm tạo một bill mới
exports.CreateBill = async (req, res) => {
    try {
        const { description, type, total } = req.body;
        const { walletInstance } = req;

        const newBill = await bill.createNewBill(walletInstance.id, type,description, total);
        logging.info(`Create new bill succefully by admin ${req.userId}, email: ${req.userEmail}, client ip: ${req.clientIp} to wallet: id: ${req.wallet_id}`);
        return res.status(201).json(newBill);
    } catch (error) {
        logging.error(`Create new bill failed by admin ${req.userId}, email: ${req.userEmail}, client ip: ${req.clientIp} to wallet: id: ${req.wallet_id}`);
        res.status(500).json({ message: 'Internal server error.', detail: error.message });
    }
};
// Xác nhận thanh toán
exports.VerifyDeposit = async(req,res)=>{
    try{
        
    }catch(error)
    {
        logging.error(`Verify Deposit failed by admin ${req.userId}, email: ${req.userEmail}, client ip: ${req.clientIp} from wallet: id: ${req.wallet_id}`);
        res.status(500).json({message: 'Internal server error', detail: error.message});
    }
}
//Tạo một voucher 
exports.CreateVoucher = async (req, res) => {
    try {
        const { voucher_name, description,discount,expiry } = req.body;
        const { walletInstance } = req;
        if(!discount)
        {
            logging.error(`Failed create new voucher because discount is empty from controllers CreateVoucher`);
            return res.status(400).json('Discount is must value');
        }         
        const newVoucher = await voucher.createVoucher(walletInstance.id,voucher_name,description,discount,expiry);
        logging.info(`Create new voucher succefully by admin ${req.userId}, email: ${req.userEmail}, client ip: ${req.clientIp} to wallet: id: ${req.wallet_id}`);
        return res.status(201).json(newVoucher);
    } catch (error) {
        logging.error(`Create new voucher failed by admin ${req.userId}, email: ${req.userEmail}, client ip: ${req.clientIp} to wallet: id: ${req.wallet_id}`);
        res.status(500).json({ message: 'Internal server error.', detail: error.message });
    }
};
