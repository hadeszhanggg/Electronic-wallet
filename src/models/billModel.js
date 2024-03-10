const config = require('../configs/dbConfig'); 

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
        type: Sequelize.BOOLEAN
      },
      expiryDays: { 
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1, 
        },
        set(value) {
          this.setDataValue('expiryDays', value);
          // Tính toán và set giá trị cho expiryDate khi expiryDays thay đổi
          const currentDate = new Date();
          const expiryDate = new Date(currentDate.getTime() + value * 24 * 60 * 60 * 1000);
          this.setDataValue('expiryDate', expiryDate);
        },
      },
      paid_date: {
        type: Sequelize.DATE
      },
    });

    Bill.createNewBill = async function (wallet_id, Description, Total, exp) {
      let bill = await this.create({
        total: Total,
        description: Description,
        paid: false,
        walletId: wallet_id,
        expiryDays: exp, // Sử dụng trường ảo để lưu số ngày hết hạn
      });

      return bill;
    };

    Bill.verifyExpiration = (bill) => {
      // Sử dụng trường ảo để so sánh ngày hết hạn với ngày hiện tại
      return bill.expiryDate.getTime() < new Date().getTime();
    };

    return Bill;
  } catch (error) {
    throw error;
  }
};
