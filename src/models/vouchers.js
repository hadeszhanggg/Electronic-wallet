module.exports = (sequelize, Sequelize) => {
    try {
      const voucher = sequelize.define("vouchers", {
        voucher_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
        },
        voucher_name: {
            type: Sequelize.TEXT
        },
        description: {
            type: Sequelize.TEXT
        },
        discount: {
            type: Sequelize.DOUBLE
        },
        created_date: {
          type: Sequelize.DATE
        },
        used_date: {
          type: Sequelize.DATE
        },
      });
      return voucher;
    }
    catch (error) {
      throw(error);
    }
  };
  