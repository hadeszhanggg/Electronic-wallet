module.exports = (sequelize, Sequelize) => {
    try {
      const Voucher = sequelize.define("vouchers", {
        voucher_name: {
            type: Sequelize.TEXT
        },
        description: {
            type: Sequelize.TEXT
        },
        discount: {
            type: Sequelize.DOUBLE
        },
        exp: {
          type: Sequelize.DATE
        },
        used_date: {
          type: Sequelize.DATE
        },
      }); 
      Voucher.createVocher = async function (wallet) {
        let expiredAt = new Date();
        expiredAt.setDate(expiredAt.getDate() + 10);
        let voucher = await this.create({
            exp: expiredAt,
            walletId: wallet.id,
            used_date: null, 
        });

        return voucher;
    };
      return Voucher;
    }
    catch (error) {
      throw(error);
    }
  };
  