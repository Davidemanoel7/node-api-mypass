const express = require('express')

const router = express.Router()

const mongoose = require('mongoose')

const User = require('../models/users')
const bcrypt = require('bcryptjs')

//não usar /users, pois em app.js já é referenciado.
// caso use, o end-point seria: /users/users/
router.get('/', (req, res, next) => {
    User.find()
        .select('_id name user email')
        .exec()
        .then( docs => {
            const response = {
                count: docs.length,
                users: docs
            }
            res.status(200).json(response)
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

router.post('/', (req, res, next) => {

    bcrypt.hash(req.body.password, 10)
    .then (
        hashedPass => {
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                user: req.body.user,
                email: req.body.email,
                password: hashedPass,
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
                            email: result.email
                        },
                    })
                })
                .catch(
                    err => {
                        console.log(err)
                        res.status(500).json({
                            error: `${err}: Já existe um usuário com o username ou email informado...`
                        })
                    }
                )
        }
    )
    .catch( err => console.log(err))
})

router.get('/:user', (req, res, next) => {
    const usr = req.params.user

    User.find({user: usr})
        .select('_id name user email password')
        .exec()
        .then( doc => {
            console.log("From mongoDB:",doc)
            if (doc) {
                res.status(200).json(doc)
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
                    { $set: req.body},
                    { new: true })
                    .then( result => res.status(200).json( {
                        message: `Updated user ${req.body.user} successfully`,
                        updatedUser : result
                    }))
                    .catch( err => res.status(500).json({
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

module.exports = router