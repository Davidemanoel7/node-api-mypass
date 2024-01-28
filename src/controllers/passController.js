const mongoose = require('mongoose');
const Pass = require('../models/pass');
const crypt = require('../middleware/crypt');

const validatorMidd = require('../middleware/validationMidw');

exports.createPassword = [ validatorMidd.validate ,(req, res, next) => {
    const id = req.userData.userId;
    const pass = req.body.password;

    const crypted = crypt.encryptString(pass);

    const newPass = new Pass({
        _id: new mongoose.Types.ObjectId(),
        url: req.body.url,
        description: req.body.description,
        password: crypted.encryptedText,
        userId: id,
        cryptKey: crypted.iv,
        modified: req.body.date ? req.body.date : Date.now()
    });

    newPass.save()
        .then( result => {
            console.log(result);
            res.status(201).json({
                message: `Password created successfully`,
                createdpass: {
                    id: result._id,
                    description: result.description,
                    userId: result.userId,
                    createdAt: result.modified
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}];

exports.getAllUserPass = (req, res, next) => {
    const id = req.userData.userId;

    Pass.find({userId: id})
        .select()
        .exec()
        .then( docs => {
            const response = docs.map( doc => {
                const encrypted = {
                    encryptedText: doc.password,
                    iv: doc.cryptKey
                }
                const crypted = crypt.decryptString(encrypted);
                const modifiedDate = new Date(doc.modified).toLocaleString();
                return {
                    pass: {
                        id: doc._id,
                        url: doc.url,
                        description: doc.description,
                        password: crypted,
                        modifiedAt: modifiedDate
                    }
                }
            })
            res.status(200).json({
                response
            })
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({error: err || '[Pass] Internal server error'})
        });
}

exports.getPassById = (req, res, next) => {
    const id = req.params.passId

    Pass.findOne({_id: id})
        .select()
        .exec()
        .then( pass => {
            const encrypted = {
                encryptedText: pass.password,
                iv: pass.cryptKey
            }
            const crypted = crypt.decryptString(encrypted);
            if ( !pass ){
                return res.status(404).json({
                    message: `Password not found for provided ID: ${id}`
                })
            }
            const modifiedDate = new Date(pass.modified).toLocaleString();
            res.status(200).json({
                pass: {
                    id: pass._id,
                    url: pass.url,
                    description: pass.description,
                    password: crypted,
                    modifiedAt: modifiedDate
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

exports.deletePassById = (req, res, next) => {
    const id = req.params.passId

    Pass.findByIdAndDelete({_id: id})
        .exec()
        .then( result => {
            if ( !result ) {
                return res.status(404).json({
                    message: `Password not found for provided ID: ${id}`
                })
            }
            res.status(200).json({
                message: `Password deleted successfully`
            })
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

exports.changePassById = [ validatorMidd.validate, (req, res, next) => {
    const id = req.params.passId
    const pass = req.body.password

    const newPass = crypt.encryptString(pass);

    Pass.findByIdAndUpdate( id ,
        { $set: {
            url: req.body.url,
            description: req.body.description,
            password: newPass.encryptedText,
            cryptKey: newPass.iv,
            modified: req.body.date ? req.body.date : Date.now()
        }},
        { new: true })
        .then( result => {
            if ( !result ) {
                return res.status(404).json({
                    message: `Password not found for provided ID: ${id}`
                })
            }
            res.status(200).json({
                message: `Password changed successfully!`,
            })
        })
        .catch( err => {
            res.status(500).json({
                erro: err,
                message: `Cannot change this pass. Try again.`
            })
        })
}];