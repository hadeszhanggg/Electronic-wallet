module.exports = (sequelize, Sequelize) => {
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
    avatar: {
      type: Sequelize.TEXT,
      default: "default"
    }, 
    deviceid:{
      type: Sequelize.TEXT,
    }
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
    User.belongsToMany(models.user, {
      as: 'Friends',
      through: models.friendship,
      foreignKey: 'userId',
      otherKey: 'friendId'
    });
  };

  // Kiểm tra role 'user' mới sở hữu ví
  User.hasRole = async function (userId, roleName) {
    const user = await this.findByPk(userId, {
      include: [{ model: models.role, through: "user" }],
    });
    if (!user || !user.roles) {
      return false;
    }
    return user.roles.some((role) => role.name === roleName);
  };

  return User;
};
