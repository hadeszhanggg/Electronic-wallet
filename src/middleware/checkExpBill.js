const db = require('../models');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

const Wallet = db.wallet;
const Bill = db.bill;

const checkExpBill = async () => {
  try {
    const currentDate = moment().tz('Asia/Ho_Chi_Minh');
    const expiredBills = await Bill.findAll({
      where: {
        expiryDays: {
          [Op.lt]: currentDate,
        },
        paid: false,
      },
      include: [{ model: Wallet }],
    });

    for (const bill of expiredBills) {
        // Kiểm tra xem có tồn tại ví không
        if (!bill.wallet) {
          console.error('Wallet not found for bill:', bill.id);
          continue;
        }
      
        // Trừ điểm uy tín
        const deductionAmount = 10; /* Tính toán điểm uy tín cần trừ */
        await bill.wallet.decrement('prestige_score', { by: deductionAmount });
      
        // Đánh dấu hóa đơn đã được xử lý
        await bill.update({ paid: true, paid_date: currentDate });
      }
      
    console.log('Deducted prestige score for expired bills.');
  } catch (error) {
    console.error('Error deducting prestige score:', error);
  }
};

module.exports = { checkExpBill };
