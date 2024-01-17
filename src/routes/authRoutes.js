const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/signin', [
    body('user').notEmpty().isString(),
    body('password').notEmpty().isString(),
], authController.sigIn );

router.patch('/forgotPass', [
    body('email').isEmail(),
    body('password').isString().isLength({ min: 6, max: 20 })
], authController.forgotPass);

module.exports = router;