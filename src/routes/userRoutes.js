const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { checkAdminAuth, checkCommonAuth, checkAllowAuth } = require('../middleware/check-auth');
const upload = require('../middleware/uploadImgMidw');

const router = express.Router();

router.post('/signup', [
    body('name').isString().isLength({ min: 4, max: 60 }),
    body('user').isString().isLength({ min: 4, max: 20 }),
    body('email').isEmail(),
    body('password').isString().isLength({ min: 6, max: 20 }),
    body('userType').optional().isString().isIn(['common', 'admin'])
], userController.signup);

router.get('/getAll/', checkAdminAuth, userController.getAllUsers);

router.get('/get/:userId', checkAllowAuth, userController.getUserById);

router.patch('/update/:userId', checkCommonAuth, [
    body('name').optional().isString().isLength({ min: 4, max: 60 }),
    body('user').optional().isString().isLength({ min: 4, max: 20 }),
    body('email').optional().isEmail(),
], userController.updateUserById);

router.delete('/del/:userId', checkAdminAuth, userController.deleteUserById);

router.patch('/activate/:userId', checkAdminAuth, userController.activateUserById);

router.patch('/inactivate/:userId', checkCommonAuth, userController.inactivateUserById);

router.patch('/changeUserPass/:userId', checkCommonAuth, [
    body('password').isString().isLength({ min: 6, max: 20 })
], userController.changeUserPass);

router.patch('/changeProfileImage/:userId', checkCommonAuth, upload.single('profileImage'), userController.changeUserProfileImage);

module.exports = router;