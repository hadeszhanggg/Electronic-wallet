const config = require('../configs/dbConfig'); 
module.exports = (sequelize, Sequelize) => {
  try {
    const Passbook = sequelize.define("passbooks", {
    passbook_name: {
        allowNull: false,
        type: Sequelize.TEXT
    },
      description: {
        type: Sequelize.TEXT
      },
      //Lãi suất
      interest_rate: {
        type: Sequelize.DOUBLE
      },
      //Kỳ hạn
      period: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
    });
    Passbook.createPassbook = async function ( passbook_name, description, interest_rate, period) {
        let passbook = await this.create({
            passbook_name: passbook_name,
            description:description,
            interest_rate: interest_rate,
            period: period,
        });
        return passbook;
    };
    return Passbook;
  } catch (error) {
    throw error;
  }
};
