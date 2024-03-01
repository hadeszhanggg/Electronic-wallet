require("dotenv").config();
module.exports = {
  secret: process.env.JWT_SECRET,
  jwtExp: 3600, 
  jwtRefreshExp: 86400, 
}