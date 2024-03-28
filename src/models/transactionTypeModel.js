// transactionTypeModel.js
module.exports = (sequelize, Sequelize) => {
    const TransactionType = sequelize.define("transaction_type", {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      }
    });
  
    return TransactionType;
  };
  