const moment = require('moment-timezone');
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
          type: Sequelize.DATE,
          allowNull: false, 
        defaultValue: moment.tz('Asia/Ho_Chi_Minh').add(10, 'days').format('YYYY-MM-DD HH:mm:ss'),
        },
        used:{
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        used_date: {
          type: Sequelize.DATE
        },
      }); 
      Voucher.createVoucher = async function (Wallet_id,Voucher_name, Description, Discount, expiry) {
        let expiredAt = new Date();
        if(!expiry){
          expiredAt= moment.tz('Asia/Ho_Chi_Minh').add(10, 'days').format('YYYY-MM-DD HH:mm:ss');
        }
         else{
          expiredAt= moment.tz('Asia/Ho_Chi_Minh').add(expiry, 'days').format('YYYY-MM-DD HH:mm:ss');
         }
        let voucher = await this.create({
          voucher_name: Voucher_name,
          description: Description,
          discount: Discount,
            exp: expiredAt,
            walletId: Wallet_id,
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
  