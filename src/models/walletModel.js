module.exports = (sequelize, Sequelize) => {
  try {
      const Wallet = sequelize.define("Wallets", {
          prestige_score: {
              type: Sequelize.INTEGER,
              default: 0
          },
          account_balance: {
              type: Sequelize.DOUBLE,
              default: 0
          },
      });
      Wallet.createWallet = async function (user) {
          let wallet = await this.create({
              userId: user.id,
              prestige_score: 100,
              account_balance: 0
          });
          return wallet;
      };
  
      return Wallet;
  } catch (error) {
      throw error;
  }
};
