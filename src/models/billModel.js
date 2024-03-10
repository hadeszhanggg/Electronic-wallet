const config = require('../configs/dbConfig'); 
module.exports = (sequelize, Sequelize) => {
  try {
    const Bill = sequelize.define("bills", {
      bill_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT
      },
      total: {
        type: Sequelize.DOUBLE
      },
      paid: {
        type: Sequelize.BOOLEAN
      },
      expiryDate: {
        type: Sequelize.DATE
      },
      paid_date: {
        type: Sequelize.DATE
      },
    });

    Bill.createToken = async function (wallet) {
      let expiredAt = new Date();
      expiredAt.setDate(expiredAt.getDate() + 10);

      // Truyền trực tiếp đối tượng Date
      let bill = await this.create({
        paid: false,
        walletId: wallet.id,
        expiryDate: expiredAt,
      });

      return bill;
    };

    Bill.verifyExpiration = (bill) => {
      // Thay đổi cách tính toán để so sánh ngày hết hạn với ngày hiện tại
      return bill.expiryDate.getTime() < new Date().getTime();
    };

    return Bill;
  } catch (error) {
    throw error;
  }
};
