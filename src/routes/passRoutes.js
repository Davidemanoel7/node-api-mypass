// passRoutes.js
const express = require('express');
const passController = require('../controllers/passController');
const { checkCommonAuth } = require('../middleware/check-auth');

const { body } = require('express-validator');

const router = express.Router();

router.post('/:userId', checkCommonAuth,[
    body('description').optional().isString().isLength({ max: 200 }),
    body('url').optional().isString().isLength({ max: 200 }),
    body('password').isString().isLength({ min: 4, max: 20 }),
], passController.createPassword);

router.get('/alluserpass/:userId', checkCommonAuth, passController.getAllUserPass);

router.get('/:passId/user/:userId/', checkCommonAuth, passController.getPassByIdAndUserId);

router.delete('/:passId/user/:userId/', checkCommonAuth, passController.deletePassByIdAndUserId);

router.patch('/changePass/:passId/user/:userId/', checkCommonAuth, [
    body('password').optional().isString().isLength({ min:4, max:20 }),
    body('description').optional().isString().isLength({ max: 200 }),
    body('url').optional().isString().isLength({ max: 200 })
], passController.changePassByIdAndUserId);


module.exports = router;