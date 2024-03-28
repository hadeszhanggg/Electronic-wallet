// transactionHistoryModel.js
const moment = require('moment-timezone');
const { DataTypes } = require('sequelize'); // Thêm import này

module.exports = (sequelize, Sequelize) => {
  const TransactionHistory = sequelize.define("transaction_history", {
    type: {
      allowNull: false,
      type: Sequelize.STRING // Loại giao dịch 
    },
    content: {
      allowNull: false,
      type: Sequelize.TEXT // Nội dung giao dịch
    },
    amount: {
      allowNull: false,
      type: Sequelize.DOUBLE // Số tiền giao dịch
    },
    date: {
      allowNull: false,
      type: DataTypes.DATE, // Sử dụng DataTypes.DATE
      get() {
        return moment(this.getDataValue('date')).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
      }
    }
  });

  TransactionHistory.createTransactionHistory = async function (Wallet_id, Type, Content, Amount) {
    try {
      const Date = moment.tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
      let transaction = await this.create({
        type: Type,
        content: Content,
        amount: Amount,
        walletId: Wallet_id,
        date:Date,
      });
      return transaction;
    } catch (error) {
      throw error;
    }
  };
  return TransactionHistory;
};

