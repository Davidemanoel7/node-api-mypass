const express = require('express')

const router = express.Router()

const mongoose = require('mongoose')

const User = require('../models/users')

//não usar /users, pois em app.js já é referenciado.
// caso use, o end-point seria: /users/users/
router.get('/', (req, res, next) => {
    User.find()
        .exec()
        .then( docs => {
            console.log(docs)
            res.status(200).json(docs)
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })  
})

router.post('/', (req, res, next) => {
    
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        user: req.body.user,
        email: req.body.email,
        password: req.body.password,
    })
    
    user.save()
        .then( result => {
            console.log(result)
            res.status(201).json({
                massage: 'Request (POST) to /users',
                createduser: user
            })
        })
        .catch(
            err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            }
        )
})

router.get('/:userId', (req, res, next) => {
    const id = req.params.userId

    User.findById(id)
        .exec()
        .then( doc => {
            console.log("From mongoDB:",doc)
            if (doc) {
                res.status(200).json(doc)
            } else {
                res.status(404).json({
                    message: "Not found or invalid entry for provided ID"
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
                    .then( result => res.status(200).json( result ))
                    .catch( err => res.status(500).json( { error: err }) )
})

router.delete('/:userId', (req, res, next) => {
    const id = req.params.userId
    
    User.findByIdAndDelete({_id: id})
        .exec()
        .then( result => {
            res.status(200).json(result)
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router