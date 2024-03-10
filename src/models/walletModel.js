module.exports = (sequelize, Sequelize) => {
    try {
      const wallet = sequelize.define("Wallets", {
        wallet_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        account_balance: {
          type: Sequelize.MONEY
        },
      });
      return wallet;
    }
    catch (error) {
      throw(error);
    }
  };
  