const config = require("../configs/dbConfig.js");
const Sequelize = require("sequelize");
//Define Sequelize connect to db.
//Uses database connection information such as name, user, password, host, port, and other configurations from the db.config.js file.
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    port: config.PORT,
    logging: false,
    operatorsAliases: 0,

    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
    }
  }
);
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
//Define of models.
db.bill = require("./billModel.js")(sequelize,Sequelize);
db.wallet=require("./walletModel.js")(sequelize, Sequelize);
db.voucher=require("./vouchersModel.js")(sequelize,Sequelize);
db.user = require("./userModel.js")(sequelize, Sequelize);
db.role = require("./roleModel.js")(sequelize, Sequelize);
db.refreshToken = require("./jwtModel.js")(sequelize, Sequelize);
db.transactionType = require("./transactionTypeModel.js")(sequelize, Sequelize);
db.transactionHistory = require("./transactionHistoryModel.js")(sequelize, Sequelize);
db.passbook =require("./passbookModel.js")(sequelize,Sequelize);
db.friendship = require("./friendshipModel.js")(sequelize, Sequelize);
//Define relationships between tables.
db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});
db.refreshToken.belongsTo(db.user, {
  foreignKey: 'userId', targetKey: 'id'
});
//user has only one wallet
db.wallet.belongsTo(db.user, {
  foreignKey: 'userId',
  targetKey: 'id'
});
db.user.hasOne(db.wallet, {
  foreignKey: 'userId',
  sourceKey: 'id'
});
//Wallets can have many bills
db.wallet.hasMany(db.bill, {
  foreignKey: 'walletId',
  sourceKey: 'id'
});
db.bill.belongsTo(db.wallet, {
  foreignKey: 'walletId',
  targetKey: 'id'
});
//Wallets can have many vouchers
db.wallet.hasMany(db.voucher, {
  foreignKey: 'walletId',
  sourceKey: 'id'
});
db.voucher.belongsTo(db.wallet, {
  foreignKey: 'walletId',
  targetKey: 'id'
});
db.transactionType.hasMany(db.transactionHistory, {
   foreignKey: 'tranTypeId',
  });
db.wallet.hasMany(db.transactionHistory,{
  foreignKey: 'walletId',
});
//Wallets has many passbook and passbook has many wallet 
db.wallets_passbooks = sequelize.define('wallets_passbooks', {
  expire: {
    type: Sequelize.DATE,
    allowNull: false
  },
  amount_deposit: {
    type: Sequelize.DOUBLE, 
    allowNull: false
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['walletId', 'passbookId']
    }
  ]
});
db.user.belongsToMany(db.user, {
  as: 'Friends',
  through: db.friendship,
  foreignKey: 'userId',
  otherKey: 'friendId'
});
db.user.belongsToMany(db.user, {
  as: 'FriendRequests',
  through: db.friendship,
  foreignKey: 'friendId',
  otherKey: 'userId'
});

// Wallet có nhiều Passbook và ngược lại
db.wallet.hasMany(db.wallets_passbooks, { foreignKey: 'walletId' });
db.wallets_passbooks.belongsTo(db.wallet, { foreignKey: 'walletId' });

db.passbook.hasMany(db.wallets_passbooks, { foreignKey: 'passbookId' });
db.wallets_passbooks.belongsTo(db.passbook, { foreignKey: 'passbookId' });
db.ROLES = ["user", "admin"];

module.exports = db;