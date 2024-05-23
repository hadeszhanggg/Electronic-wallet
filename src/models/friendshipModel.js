module.exports = (sequelize, Sequelize) => {
  const Friendship = sequelize.define("friendships", {
    userId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      field: 'userId' 
    },
    friendId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      field: 'friendId'  
    },
    status: {
      type: Sequelize.TEXT,
      allowNull: false
    }
  });

  return Friendship;
};
