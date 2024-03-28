// passRoutes.js
const express = require('express');
const passController = require('../controllers/passController');
const { checkAuth } = require('../middleware/check-auth');

const { body } = require('express-validator');

const router = express.Router();

router.post('/', checkAuth,[
    body('description').isString().isLength({ max: 200 }),
    body('url').optional().isString().isLength({ max: 200 }),
    body('password').isString().isLength({ min: 4, max: 20 }),
    body('date').optional().isNumeric()
], passController.createPassword);

router.get('/alluserpass/', checkAuth, passController.getAllUserPass);

router.get('/', checkAuth, passController.getPassById);

router.delete('/del', checkAuth, passController.deletePassById);

router.patch('/changePass', checkAuth, [
    body('password').optional().isString().isLength({ min:4, max:20 }),
    body('description').isString().isLength({ max: 200 }),
    body('url').optional().isString().isLength({ max: 200 }),
    body('date').optional().isNumeric()
], passController.changePassById);


module.exports = router;