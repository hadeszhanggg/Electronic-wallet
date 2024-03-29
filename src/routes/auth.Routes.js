const express = require('express');
const authController = require('../controllers/auth.Controllers');
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
  router.post('/signin', authController.signin);

  app.use('/auth', router);
};