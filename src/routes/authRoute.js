const {generateToken }= require('../services/jwtRefresh');
const express = require('express');
const authController = require('../controllers/authController');
module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Authorization, x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  const router = express.Router();

  router.post('/signup', authController.signup);
  router.post('/login', authController.login);

  app.use('/auth', router);
};