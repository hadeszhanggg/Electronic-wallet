const config = require("../configs/authConfig");
const db = require("../models/");
const User = db.user;
const jwt = require("jsonwebtoken");
const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    //logger.error(`Unauthorized! Access Token was expired! Implementer: IP address: [${clientIp}], userID: [${userId}], Email: [${userEmail}]. CodeLocation: [catchError] function in middleware/authJwt.js`);
    return res.status(401).send({ message: "Unauthorized!" });
  }
  //logger.error(`Unauthorized! Access Token was expired!, Implementer: IP address: [${clientIp}], userID: [${userId}], Email: [${userEmail}]. CodeLocation: [catchError] function in middleware/authJwt.js`);
  return res.status(401).send({ message: "Unauthorized!" });
}
const authenticateToken = (req, res, next) => {
    let token = req.headers["x-access-token"] || req.headers["authorization"];
  
    if (!token) {
      return res.status(403).send({
        message: "No token provided!"
      });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    } else {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return catchError(err, res);
      }
      req.userId = decoded.id;
      next();
    });
}

const isAdmin = (req) => {
    return new Promise((resolve, reject) => {
      User.findByPk(req.userId)
        .then((user) => {
          if (!user) {
            console.log("User not found");
            reject(false);
            return;
          }

          user.getRoles()
            .then((roles) => {
              if (!roles || roles.length === 0) {
                console.log("Roles not found for user");
                reject(false);
                return;
              }

              for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "admin") {
                  resolve(true);
                  return;
                }
              }
              resolve(false);
            })
            .catch((error) => {
              console.log(error);
              reject(false);
            });
        })
        .catch((error) => {
          console.log(error);
          reject(false);
        });
    });
};

module.exports = { authenticateToken, isAdmin };
