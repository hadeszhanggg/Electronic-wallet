// controllers/bill.controllers.js
const { bill } = require('../models');

exports.CreateBill = async (req, res) => {
    try {
        const { description, total, expiry } = req.body;
        const { walletInstance } = req;

        const newBill = await bill.createNewBill(walletInstance.id, description, total, expiry);

        return res.status(201).json(newBill);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};
