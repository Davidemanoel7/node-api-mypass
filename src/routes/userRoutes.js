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

router.get('/get/', checkAllowAuth, userController.getUser);

router.patch('/update/', checkAllowAuth, [
    body('name').optional().isString().isLength({ min: 4, max: 60 }),
    body('user').optional().isString().isLength({ min: 4, max: 20 }),
    body('email').optional().isEmail(),
], userController.updateUser);

router.delete('/del/', checkAdminAuth, userController.deleteUserById);

router.patch('/inactivate/', checkCommonAuth, userController.inactivateUser);

router.patch('/changeUserPass/', checkAllowAuth, [
    body('password').isString().isLength({ min: 6, max: 20 })
], userController.changeUserPass);

router.patch('/changeProfileImage/', checkAllowAuth, upload.single('profileImage'), userController.changeUserProfileImage);

module.exports = router;