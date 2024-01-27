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

router.get('/:passId/', checkCommonAuth, passController.getPassById);

router.delete('/del/:passId/', checkCommonAuth, passController.deletePassById);

router.patch('/changePass/:passId/', checkCommonAuth, [
    body('password').optional().isString().isLength({ min:4, max:20 }),
    body('description').isString().isLength({ max: 200 }),
    body('url').optional().isString().isLength({ max: 200 }),
    body('date').optional().isNumeric()
], passController.changePassById);


module.exports = router;