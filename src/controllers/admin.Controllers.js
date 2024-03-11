// controllers/bill.controllers.js
const { bill,voucher } = require('../models');
//hàm tạo một bill mới
exports.CreateBill = async (req, res) => {
    try {
        const { description, total } = req.body;
        const { walletInstance } = req;

        const newBill = await bill.createNewBill(walletInstance.id, description, total);

        return res.status(201).json(newBill);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.', detail: error.message });
    }
};
//kiểm tra tất cả các bill quá hạn.
exports.VerifyDeposit = async(req,res)=>{
    try{

    }catch(error)
    {
        res.status(500).json({message: 'Internal server error', detail: error.message});
    }
}
//Tạo một voucher 
exports.CreateVoucher = async (req, res) => {
    try {
        const { voucher_name, description,discount,expiry } = req.body;
        const { walletInstance } = req;
        const newVoucher = await voucher.createVoucher(walletInstance.id,voucher_name,description,discount,expiry);
        return res.status(201).json(newVoucher);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.', detail: error.message });
    }
};
