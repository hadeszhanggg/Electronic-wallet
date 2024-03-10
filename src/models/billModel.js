module.exports = (sequelize, Sequelize) => {
    try {
      const bill = sequelize.define("bills", {
        bill_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT
        },
        total: {
          type: Sequelize.MONEY
        },
        paid: {
          type: Sequelize.BOOLEAN
        },
        paid_date: {
          type: Sequelize.DATE
        },
      });
      return bill;
    }
    catch (error) {
      throw(error);
    }
  };
  