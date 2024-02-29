module.exports = (sequelize, Sequelize) => {
  try {
    const User = sequelize.define("users", {
      username: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.TEXT
      },
    });
    return User;
  }
  catch (error) {
    throw(error);
  }
};
