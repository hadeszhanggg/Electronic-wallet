const config = require('../configs/dbConfig'); 
const moment = require('moment-timezone');
module.exports = (sequelize, Sequelize) => {
  try {
    const Bill = sequelize.define("bills", {
      description: {
        type: Sequelize.TEXT
      },
      total: {
        type: Sequelize.DOUBLE
      },
      paid: {
        type: Sequelize.BOOLEAN,
        defaultValue:false
      },
      expiryDays: { 
        type: Sequelize.DATE,
        allowNull: false, 
        defaultValue: moment.tz('Asia/Ho_Chi_Minh').add(10, 'days').format('YYYY-MM-DD HH:mm:ss'),
      },
      paid_date: {
        type: Sequelize.DATE
      },
    });
    //tạo một bill mới 
    Bill.createNewBill = async function (wallet_id, Description, Total) {
      let bill = await this.create({
        total: Total,
        description: Description,
        paid: false,
        walletId: wallet_id, 
      });
      return bill;
    };
    //xác nhận ngày hết hạn không được nhỏ hơn ngày hiện tại
    Bill.verifyExpiration = (bill) => {
      return bill.expiryDays.getTime() < new Date().getTime();
    };

    return Bill;
  } catch (error) {
    throw error;
  }
};
