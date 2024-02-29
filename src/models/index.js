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
db.user = require("./userModel.js")(sequelize, Sequelize);
db.role = require("./roleModel.js")(sequelize, Sequelize);
db.refreshToken = require("./jwtModel.js")(sequelize, Sequelize);
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

db.ROLES = ["user", "admin"];

module.exports = db;
