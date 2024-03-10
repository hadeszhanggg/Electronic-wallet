module.exports = (sequelize, Sequelize) => {
  try {
    const User = sequelize.define("users", {
      username: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.TEXT
      },
      address: {
        type: Sequelize.TEXT
      },
      email: {
        type: Sequelize.TEXT
      },
      gender: {
        type: Sequelize.BOOLEAN
      },
      gender: {
        type: Sequelize.BOOLEAN
      },
    });
    return User;
  }
  catch (error) {
    throw(error);
  }
};
