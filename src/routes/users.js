const express = require('express')

const router = express.Router()

const mongoose = require('mongoose')

const User = require('../models/users')
const bcrypt = require('bcryptjs')

const { body, validationResult } = require('express-validator')

const { checkCommonAuth, checkAdminAuth, checkAllowAuth } = require('../middleware/check-auth')

const multer = require('multer');
// const { options } = require('./auth')


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads');
    },
    filename: (req, file, callback) => {
        callback(null, new Date().toISOString() + file.originalname)
    }
})

const fileFilter = (req, file, callback) => {
    if( file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        callback(null, true);
    } else {
        callback(new Error('image type or size not supported'), false)
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter,
})

//não usar /users, pois em app.js já é referenciado.
// caso use, o end-point seria: /users/users/
router.get('/', checkAdminAuth, (req, res, next) => {
    User.find()
        .select('_id name user email')
        .exec()
        .then( docs => {
            const response = {
                count: docs.length,
                users: docs
            }
            res.status(200).json({
                user: response,
            })
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

router.post('/signup',
    [
        body('name').isString().isLength({ min: 4, max: 60 }),
        body('user').isString().isLength({ min: 4, max: 20 }),
        body('email').isEmail(),
        body('password').isString().isLength({ min: 6, max: 20 }),
        body('userType').optional().isString().isIn(['common', 'admin'])
    ], (req, res, next) => {
    
    const validRes = validationResult(req);

    if ( !validRes.isEmpty() ) {
        return res.status(422).json({
            message: `Oops... error in ${validRes.errors[0].path} field with value:${validRes.errors[0].value}. Try again!`,
            errors: validRes.array()
        });
    }

    bcrypt.hash( req.body.password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({
                error: err,
            })
        } else {
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                user: req.body.user,
                email: req.body.email,
                password: hash,
                userType: req.body.userType
            });
            user.save()
                .then( result => {
                    console.log(result)
                    res.status(201).json({
                        massage: `Created user ${result.user} successfully`,
                        createduser: {
                            id: result._id,
                            name: result.name,
                            user: result.user,
                            email: result.email,
                            request: {
                                type: "GET",
                                url: `users/${result.user}/`,
                            }
                        },
                    })
                })
                .catch( err => {
                    console.log(err)
                    res.status(500).json({
                        error: err,
                        message: `Cannot save this user... please try again :(`
                    })
                })
        }})
})

router.get('/:userId', checkAllowAuth, (req, res, next) => {
    const id = req.params.userId

    User.findOne({_id: id})
        .select('_id name user email profileImage living')
        .exec()
        .then( doc => {
            if ( doc && doc.living ) {
                res.status(200).json({
                    user: doc,
                    requests: {
                        type: "PATCH/DELETE",
                        url: `/users/${doc._id}`
                    }
                })
            } else {
                res.status(404).json({
                    message: `User not found or invalid ${usr}`
                })
            }
        })
        .catch( err => {
            console.log(err)
            res.status(500).json( {error: err || 'Internal server error...'} )
        })
})

// partial changes on user.schema
router.patch('/:userId', checkCommonAuth,
    [
        body('name').optional().isString().isLength({ min: 4, max: 60 }),
        body('user').optional().isString().isLength({ min: 4, max: 20 }),
        body('email').optional().isEmail(),
    ], (req, res, next) => {

    const id = req.params.userId

    const errors = validationResult(req);

    if ( !errors.isEmpty() ) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    User.findByIdAndUpdate( id,
                    { $set: {
                        name: req.body.name,
                        user: req.body.user,
                        email: req.body.email,
                    }},
                    { new: true })
                    .then( result => {
                        console.log(result);
                        res.status(200).json({
                            message: `Updated user ${result.user} successfully`,
                            updatedUser : result,
                            request: {
                                type: 'GET/',
                                url: `/users/${result.user}`
                            }
                        })
                    })
                    .catch( err => res.status(500).json({
                        message: `User not found by ID:${req.params.userId}...`,
                        error: err
                    }))
})

router.delete('/:userId', checkAdminAuth, (req, res, next) => {
    const id = req.params.userId

    User.findByIdAndDelete({_id: id})
        .exec()
        .then( result => {
            res.status(200).json({
                message: `User ${result.user} deleted successfully`,
                deletedUser: result
            })
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

router.patch('/changeProfileImage/:userId', checkCommonAuth,
    upload.single('profileImage'), (req, res, next) => {
    const id = req.params.userId

    User.findByIdAndUpdate( id,
        { $set: { profileImage: req.file.path }},
        { new: true })
        .then( result => {
            console.log(result)
            res.status(200).json({
                message: `Profile image changed from user ${result.user}!`,
                request: {
                    type: 'GET/',
                    url: `/users/${result.user}`
                }
            })
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: err,
                message: `User by ID:${req.params.userId} not found OR Cannot change profile image :(`
            })
        })
})

router.patch('/changeUserPass/:userId', checkAllowAuth,
    [
        body('password').isString().isLength({ min: 6, max: 20 })
    ], (req, res, next) => {

    const id = req.params.userId
    const pass = req.body.password

    const errors = validationResult(req);

    if ( !errors.isEmpty() ) {
        return res.status(422).json({
            errors: errors.array()
        });
    }
    bcrypt.hash( pass , 10, (err, obj) => {
        if (err) {
            return res.status(500).json({
                error: err
            })
        }

        User.findByIdAndUpdate( id ,
            { $set: { password: obj } },
            { new: true }
        )
        .then( result => {
            res.status(200).json({
                message: `Password changed successfully!`
            })
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
    })

})

router.patch('/inactivate/:userId/', checkCommonAuth, (req, res, next) => {
    const id = req.params.userId

    User.findByIdAndUpdate(id,
        { $set: { living: false }},
        { new: true })
        .then( usr => {
            if (!usr) {
                return res.status(404).json({
                    message: 'User not found'
                })
            }

            console.log(usr)
            res.status(200).json({
                user: usr,
                message: `User ${usr.name} inactivated successfully!`
            })
        })
        .catch( err => {
            res.status(500).json({
                error: err
            })
        })
})

router.patch('/activate/:userId/', checkAdminAuth, (req, res, next) => {
    const id = req.params.userId

    User.findByIdAndUpdate(id,
        { $set: { living: true }},
        { new: true })
        .then( usr => {
            if (!usr) {
                return res.status(404).json({
                    message: 'User not found'
                })
            }

            console.log(usr)
            res.status(200).json({
                user: usr,
                message: `Welcome back! ${usr.name} is activated successfully!`
            })
        })
        .catch( err => {
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router