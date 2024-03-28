module.exports = (sequelize, Sequelize) => {
  try {
      const Wallet = sequelize.define("Wallets", {
          prestige_score: {
              type: Sequelize.INTEGER
          },
          account_balance: {
              type: Sequelize.DOUBLE
          },
      });
      Wallet.createWallet = async function (user) {
          let wallet = await this.create({
              userId: user.id,
              account_balance: 0,
              prestige_score: 100
          });

          return wallet;
      };

      return Wallet;
  } catch (error) {
      throw error;
  }
};
