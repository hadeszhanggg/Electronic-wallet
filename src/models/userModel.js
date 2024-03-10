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
      date_of_birth: {
        type: Sequelize.DATE
      },
    });
    User.associate = (models) => {
      User.belongsToMany(models.role, {
        through: "user_roles",
        foreignKey: "userId",
        otherKey: "roleId"
      });
      User.hasOne(models.wallet, {
        foreignKey: 'userId',
        sourceKey: 'id'
      });
    };
    return User;
  }
  catch (error) {
    throw(error);
  }
};
