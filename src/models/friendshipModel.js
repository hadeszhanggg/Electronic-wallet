module.exports = (sequelize, Sequelize) => {
  const Friendship = sequelize.define("friendships", {
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    friendId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    isConfirmed: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    uniqueKeys: {
      uniqueFriendship: {
        fields: ['userId', 'friendId']
      }
    }
  });

  return Friendship;
};
