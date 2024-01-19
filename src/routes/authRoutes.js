const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signin', authController.sigIn );

router.patch('/forgotPass/', [
    body('email').isEmail()
], authController.forgotPass);

router.patch('/resetPass/:token', [
    body('password').isString().isLength({ min: 6, max:20 }),
], authController.resetPass);

module.exports = router;