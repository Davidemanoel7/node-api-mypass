const mongoose = require('mongoose');
const User = require('../models/users');
const Pass = require('../models/pass');
const crypt = require('../middleware/crypt');

const { validationResult } = require('express-validator');

exports.createPassword = (req, res, next) => {
    const id = req.params.userId;
    const pass = req.body.password;

    // Validação dos campos usando express-validator
    const validRes = validationResult(req);

    if (!validRes.isEmpty()) {
        return res.status(422).json({
            message: `Oops... error in ${validRes.errors[0].path} field with value:${validRes.errors[0].value}. Try again!`,
            errors: validRes.array()
        });
    }

    User.findOne({ _id: id, living: true })
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: `User not found with ID ${id}`
                });
            } else {
                const crypted = crypt.encryptString(pass);

                const newPass = new Pass({
                    _id: new mongoose.Types.ObjectId(),
                    url: req.body.url,
                    description: req.body.description,
                    password: crypted.encryptedText,
                    userId: user._id,
                    cryptKey: crypted.iv
                });

                newPass.save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: `Password created successfully for user ${user.user}`,
                            createdpass: {
                                id: result._id,
                                description: result.description,
                                userId: result.userId
                            }
                        });
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

exports.getAllUserPass = (req, res, next) => {
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
}

exports.getPassByIdAndUserId = (req, res, next) => {
    const id = req.params.passId

    Pass.findOne({_id: id})
        .select('_id description url password cryptKey userId')
        .exec()
        .then( pass => {
            const encrypted = {
                encryptedText: pass.password,
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
}

exports.deletePassByIdAndUserId = (req, res, next) => {
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
}

exports.changePassByIdAndUserId = (req, res, next) => {
    const id = req.params.passId
    const pass = req.body.password

    const validRes = validationResult(req);

    if ( !validRes.isEmpty() ) {
        return res.status(422).json({
            message: `Oops... error in field with value:${validRes.errors}. Try again!`,
            errors: validRes.array()
        });
    }

    const newPass = crypt.encryptString(pass);

    Pass.findByIdAndUpdate( id ,
        { $set: {
            url: req.body.url,
            description: req.body.description,
            password: newPass.encryptedText,
            cryptKey: newPass.iv
        }},
        { new: true })
        .then( result => {
            console.log(`\n${result}\n`)
            res.status(200).json({
                message: `Password changed successfully!`,
            })
        })
        .catch( err => {
            res.status(500).json({
                erro: err,
                message: `User by ID:${req.params.userId} not found OR Cannot change pass :(`
            })
        })
}