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
    
    const pass = new Pass({
        _id: new mongoose.Types.ObjectId(),
        description: req.body.description,
        password: req.body.password,
        userId: req.body.userId
    })

    pass.save()
        .then( result => {
            console.log(result)
            res.status(201).json({
                message: 'Request (POST) to /pass sucessfully',
                createdpass: pass
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

// GET all passwords with userId
router.get('/:userId', (req, res, next) => {
    const id = req.params.userId
    
    Pass.find({userId: id})
        .exec()
        .then( doc => {
            console.log('From mongoDB', doc)
            if ( doc ) {
                res.status(200).json( doc )
            } else {
                res.status(404).json({
                message: "Not found or invalid entry for provided ID"
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