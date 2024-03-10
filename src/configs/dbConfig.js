require("dotenv").config();
module.exports = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_DB,
  PORT: process.env.DB_PORT,
  dialect: process.env.DB_DIALECT,
  pool: {
    max: 15,
    min: 0,
    acquire: 30000,
  }
};