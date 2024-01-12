const express = require('express')

const router = express.Router()

const mongoose = require('mongoose')

const User = require('../models/users')
const bcrypt = require('bcryptjs')

const multer = require('multer');

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
router.get('/', (req, res, next) => {
    User.find()
        .select('_id name user email')
        .exec()
        .then( docs => {
            const response = {
                count: docs.length,
                users: docs.map( doc => {
                    return {
                        _id: doc._id,
                        name: doc.name,
                        user: doc.user,
                        email: doc.email,
                        request: {
                            type: "GET",
                            url: `/users/${doc.user}`
                        }
                    }
                })
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

router.post('/', (req, res, next) => {

    const pass = req.body.password

    if ( pass && pass === "" || pass.length < 6) {
        return res.status(500).json({
            message: `Cannot create pass:${pass} because its empty or less than 6 characters`
        })
    }
    const hashedPass = bcrypt.hashSync(pass, 10)

    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        user: req.body.user,
        email: req.body.email,
        password: hashedPass,
        // profileImage: req.file.path
    })
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
        .catch(
            err => {
                console.log(err)
                res.status(500).json({
                    error: err,
                    message: `User by ${req.body.user} or ${req.body.email} already exists`
                })
            }
        )
})

router.get('/:user', (req, res, next) => {
    const usr = req.params.user

    User.find({user: usr})
        .select('_id name user email password profileImage')
        .exec()
        .then( doc => {
            if ( doc ) {
                res.status(200).json({
                    user: doc,
                    requests: {
                        type: "PATCH/DELETE",
                        url: `/users/${doc.map(e => e._id)}`
                    }
                })
            } else {
                res.status(404).json({
                    message: `Not found or invalid entry for provided ID ${req.params.userId}`
                })
            }
        })
        .catch( err => {
            console.log(err)
            res.status(500).json( {error: err} )
        })
})

// partial changes on user.schema
router.patch('/:userId', (req, res, next) => {
    const id = req.params.userId

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

router.delete('/:userId', (req, res, next) => {
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

router.patch('/:userId/changePass', (req, res, next) => {
    const id = req.params.userId
    const pass = req.body.password

    if ( pass && pass === "" || pass.length < 6) {
        return res.status(500).json({
            message: `Cannot change to ${pass} because it cannot be empty or less than 6 characters`
        })
    }
    const newPass = bcrypt.hashSync(pass, 10)

    User.findByIdAndUpdate(id ,
        { $set: { password: newPass }},
        { new: true })
        .then( result => {
            console.log(`\n${result}\n`)
            res.status(200).json({
                message: `Password changed from user ${result.user}`,
            })
        })
        .catch( err => {
            res.status(500).json({
                erro: err,
                message: `User by ID:${req.params.userId} not found OR Cannot change pass :(`
            })
        })
})

router.patch('/:userId/changeProfileImage', upload.single('profileImage'), (req, res, next) => {
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

module.exports = router