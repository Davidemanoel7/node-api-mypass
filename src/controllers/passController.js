require('dotenv').config();
const mongoose = require('mongoose');
const Pass = require('../models/pass');
const crypt = require('../middleware/crypt');

const validatorMidd = require('../middleware/validationMidw');

exports.createPassword = [ validatorMidd.validate, async (req, res, next) => {
    const id = req.userData.userId;
    const pass = req.body.password;
    try {
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

        await newPass.save();
        
        res.status(201).json({
            message: `Password created successfully`,
            createdpass: {
                id: newPass._id,
                description: newPass.description,
                userId: newPass.userId,
                createdAt: newPass.modified
            }
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
        throw err;
    }
}];

exports.getAllUserPass = async (req, res, next) => {
    const id = req.userData.userId;

    try {
        const arrayPass = await Pass.find({ userId: id }).select().exec();
        const passwords = arrayPass.map( p => {
            const encrypted = {
                encryptedText: p.password,
                iv: p.cryptKey
            }
            const crypted = crypt.decryptString(encrypted);
            const modifiedDate = new Date(p.modified).toLocaleString();

            return {
                id: p._id,
                url: p.url,
                description: p.description,
                password: crypted,
                modifiedAt: modifiedDate
            }
        })

        res.status(200).json({
            count: passwords.length,
            passwords
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({error: err || '[Pass] Internal server error'})
    }
}

exports.getPassById = async (req, res, next) => {
    const id = req.params.passId
    try {
        const pass = await Pass.findOne({ _id: id }).select().exec();

        if ( !pass ){
            return res.status(404).json({
                message: `Password not found for provided ID: ${id}`
            })
        }

        const encrypted = {
            encryptedText: pass.password,
            iv: pass.cryptKey
        }
        const crypted = crypt.decryptString(encrypted);

        const modifiedDate = new Date(pass.modified).toLocaleString();
        res.status(200).json({
                id: pass._id,
                url: pass.url,
                description: pass.description,
                password: crypted,
                modifiedAt: modifiedDate
        });   
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        });
    }
    
}

exports.deletePassById = async (req, res, next) => {
    const id = req.params.passId
    try {
        const deletePass = await Pass.findByIdAndDelete({ _id: id });

        if ( !deletePass ) {
            return res.status(404).json({
                message: `Password not found for provided ID: ${id}`
            })
        };

        res.status(200).json({
            message: `Password deleted successfully`
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

exports.changePassById = [ validatorMidd.validate, async (req, res, next) => {
    const id = req.params.passId
    const pass = req.body.password
    
    try {
        const newPass = crypt.encryptString(pass);
        const changedPass = await Pass.findByIdAndUpdate( id ,
            { $set: {
                url: req.body.url,
                description: req.body.description,
                password: newPass.encryptedText,
                cryptKey: newPass.iv,
                modified: req.body.date ? req.body.date : Date.now()
            }}, { new: true });

        if ( !changedPass ) {
            return res.status(404).json({
                message: `Password not found for provided ID: ${id}`
            })
        }

        res.status(200).json({
            message: `Password changed successfully!`,
        });

    } catch (err) {
        res.status(500).json({
            error: err,
            message: `Cannot change this pass. Try again.`
        })
    }
}];