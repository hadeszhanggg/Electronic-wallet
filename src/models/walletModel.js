module.exports = (sequelize, Sequelize) => {
  try {
      const Wallet = sequelize.define("Wallets", {
          prestige_score: {
            allowNull: false,
              type: Sequelize.INTEGER,
              default: 0
          },
          account_balance: {
                allowNull: false,
              type: Sequelize.DOUBLE,
              default: 0
          },
      });
      Wallet.createWallet = async function (user) {
          let wallet = await this.create({
              userId: user.id,
              prestige_score: 100
          });

          return wallet;
      };
      Wallet.depositMoney=async function(amount)
      {
        this.account_balance+=amount;
      }
      return Wallet;
  } catch (error) {
      throw error;
  }
};
