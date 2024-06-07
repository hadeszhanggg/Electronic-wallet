const express = require('express');
const db = require("../models");
const bcrypt = require('bcrypt');
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
   //Route forgot password
   router.put('/forgotPassword', async (req, res) => {
    try {
        authController.forgotPassword(req,res);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});   

  app.use('/auth', router);
};