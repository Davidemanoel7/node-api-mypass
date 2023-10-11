const express = require('express')

const router = express.Router()

const mongoose = require('mongoose')

const Pass = require('../models/pass')
const User = require('../models/users')

//não usar /pass, pois em app.js já é referenciado.
// caso use, o end-point seria: /pass/pass/
router.get('/', (req, res, next) => {
    Pass.find()
        .then( docs => {
            const response = {
                count: docs.length,
                pass: docs
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
    // https://youtu.be/VKuY8QscZwY?si=t4yoF1X8U31ZMp_6&t=896
    User.findById(req.body.userId)
        .then( user => {
            if (!user){
                return res.status(404).json({
                    message: `User not found with ID ${req.body.userId}`
                })
            } else {
                const newPass = new Pass({
                    _id: new mongoose.Types.ObjectId(),
                    description: req.body.description,
                    password: req.body.password,
                    userId: req.body.userId
                })
                newPass.save()
                .then( result => {
                    console.log(result)
                    res.status(201).json({
                        message: `Password created sucessfully for user by ID`,
                        createdpass: {
                            id: result._id,
                            description: result.description,
                            userId: result.userId
                        }
                    })
                })
                .catch( err => {
                    res.status(500).json({
                        error: err
                    })
                })
            }
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

// GET all passwords with userId
router.get('/:userId', (req, res, next) => {
    const id = req.params.userId
    
    Pass.find({userId: id})
        .select('_id description password userId')
        .exec()
        .then( doc => {
            console.log('From mongoDB', doc)
            if ( doc ) {
                res.status(200).json( doc )
            } else {
                res.status(404).json({
                message: `Not found or invalid entry for provided ID ${req.params.userId}`
                })
            }
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({error: err})
        })
})

router.delete('/:passId', (req, res, next) => {
    const id = req.params.passId

    Pass.findByIdAndDelete({_id: id})
        .exec()
        .then( result => {
            res.status(200).json({
                message: `Password deleted successfully for user ${result.user}`,
                deletedPass: result
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