// transactionHistoryModel.js
const moment = require('moment-timezone');
const { DataTypes } = require('sequelize'); 

module.exports = (sequelize, Sequelize) => {
  const TransactionHistory = sequelize.define("transaction_history", {
    content: {
      allowNull: false,
      type: Sequelize.TEXT // Nội dung giao dịch
    },
    amount: {
      allowNull: false,
      type: Sequelize.DOUBLE 
    },
    date: {
      allowNull: false,
      type: DataTypes.DATE, 
      get() {
        return moment(this.getDataValue('date')).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');
      }
    }
  });
 // Liên kết với TransactionType và Wallet
 TransactionHistory.associate = (models) => {
  TransactionHistory.belongsTo(models.transaction_type, {
    foreignKey: {
      allowNull: false,
      field: 'tranTypeId' // Tên trường foreign key trên bảng transaction_histories
    }
  });
  TransactionHistory.belongsTo(models.wallet, {
    foreignKey: {
      allowNull: false,
      field: 'walletId'
    }
  });
};


  TransactionHistory.createTransactionHistory = async function (Wallet_id, Type, Content, Amount) {
    try {
      const Date = moment.tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss');

      let transaction = await this.create({
        content: Content,
        amount: Amount,
        walletId: Wallet_id,
        transactionType:Type,
        date:Date,
      });
      return transaction;
    } catch (error) {
      throw error;
    }
  };
  return TransactionHistory;
};