const express = require('express')

const router = express.Router()

const mongoose = require('mongoose')

const Pass = require('../models/pass')
const User = require('../models/users')

const bcrypt = require('bcryptjs')

const crypt = require('../../services/crypt.js')

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
                error: err || 'Internal server error'
            })
        })
})

router.post('/:userId', (req, res, next) => {
    const id = req.params.userId

    User.findOne({_id: id, living: true})
        .then( user => {
            if (!user){
                return res.status(404).json({
                    message: `User not found with ID ${id}`
                })
            } else {
                const crypted = crypt.encryptString(req.body.password);
                const newPass = new Pass({
                    _id: new mongoose.Types.ObjectId(),
                    url: req.body.url,
                    description: req.body.description,
                    password: crypted.encryptedText,
                    userId: user._id,
                    cryptKey: crypted.iv
                })
                newPass.save()
                    .then( result => {
                        console.log(result)
                        res.status(201).json({
                            message: `Password created sucessfully for user ${user.user}`,
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
router.get('/alluserpass/:userId', (req, res, next) => {
    const id = req.params.userId
    
    User.findOne({_id: id, living: true })
        .exec()
        .then( user => {
            if ( user ) {
                Pass.find({userId: id})
                    .select('_id description url password cryptKey userId')
                    .exec()
                    .then( docs => {
                        const response = docs.map( doc => {
                            const encrypted = {
                                encryptedText: doc.password,
                                iv: doc.cryptKey
                            }
                            const crypted = crypt.decryptString(encrypted);
                            return {
                                pass: {
                                    id: doc._id,
                                    url: doc.url,
                                    description: doc.description,
                                    password: crypted,
                                }
                            }
                        })
                        if ( docs ) {
                            res.status(200).json({
                                response
                            })
                        } else {
                            res.status(404).json({
                                message: `Not found pass or invalid entry for user ${user.user}`
                            })
                        }
                    })
                    .catch( err => {
                        console.log(err)
                        res.status(500).json({error: err || '[Pass] Internal server error'})
                    });
            } else {
                res.status(404).json({
                    message: `Not found or invalid entry for provided ID ${req.params.userId}`
                });
            }
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: err || '[User] Internal server error'
            })
        })
})

router.get('/:passId/', (req, res, next) => {
    const id = req.params.passId

    Pass.findOne({_id: id})
        .select('_id description url password cryptKey userId')
        .exec()
        .then( pass => {
            const encrypted = {
                encryptedText: pass.password ,
                iv: pass.cryptKey
            }
            const crypted = crypt.decryptString(encrypted);
            res.status(200).json({
                pass: {
                    id: pass._id,
                    url: pass.url,
                    description: pass.description,
                    password: crypted
                }
            });
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: err
            });
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

module.exports = router