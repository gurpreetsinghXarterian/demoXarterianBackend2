const express = require('express');
const Router = express.Router();
const { sendOtp, verifyOtp } = require('../controllers/otpController');

Router.post('/sendOtp', sendOtp);
Router.post('/verifyOtp', verifyOtp);

module.exports = Router;
