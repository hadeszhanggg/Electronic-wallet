const config = require("../configs/authConfig");
const db = require("../models/");
const User = db.user;
const jwt = require("jsonwebtoken");
const { TokenExpiredError } = jwt;
const requestIp = require('request-ip');
const logging=require('../middleware/logging');
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
//Middleware to log user information and add it to the request object.
const logUserInfo = (req, res, next) => {
  // Get user information from the database based on the user ID in the request
  User.findByPk(req.userId)
    .then(async (user) => {
      if (user) {
        // Extract user information and add it to the request object
        req.clientIp = requestIp.getClientIp(req); // Get client IP address
        req.userEmail = user.email; // Extract user email
        req.userId = user.id; // Extract user ID

        // Get user roles and add them to the request object
        const roles = await user.getRoles();
        req.roles = roles.map(role => role.name); // Extract user roles
      }
      // Move to the next middleware or route handler
      next();
    })
    .catch(error => {
      // Handle any errors that occur during user retrieval
      logger.error(`Error retrieving user information: ${error.message}, codeLocation: [logUserInfo] function in middleware/authJwt.js`);
      // Move to the next middleware or route handler even if an error occurs
      next();
    });
};
module.exports = { authenticateToken, isAdmin,logUserInfo };
