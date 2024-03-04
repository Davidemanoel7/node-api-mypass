// passRoutes.js
const express = require('express');
const passController = require('../controllers/passController');
const { checkCommonAuth } = require('../middleware/check-auth');

const { body } = require('express-validator');

const router = express.Router();

router.post('/', checkCommonAuth,[
    body('description').isString().isLength({ max: 200 }),
    body('url').optional().isString().isLength({ max: 200 }),
    body('password').isString().isLength({ min: 4, max: 20 }),
    body('date').optional().isNumeric()
], passController.createPassword);

router.get('/alluserpass/', checkCommonAuth, passController.getAllUserPass);

router.get('/', checkCommonAuth, passController.getPassById);

router.delete('/del', checkCommonAuth, passController.deletePassById);

router.patch('/changePass', checkCommonAuth, [
    body('password').optional().isString().isLength({ min:4, max:20 }),
    body('description').isString().isLength({ max: 200 }),
    body('url').optional().isString().isLength({ max: 200 }),
    body('date').optional().isNumeric()
], passController.changePassById);


module.exports = router;