const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');

// const validator = require('../middleware/validationMidw'); // TEM UM MIDDLEWARE QUE FAZ ISSO JÁ.

exports.sigIn = (req, res, next) => {
    const usr = req.body.user
    const pass = req.body.password

    const errors = validationResult(req)

    if ( !errors.isEmpty() ) {
        return res.status(422).json({
            error: errors.array()
        })
    }

    User.findOne({ user: usr, living: true })
        .then( user => {
            if ( !user ) {
                return res.status(404).json({
                    message: `User ${usr} not found`
                });
            } else {
                bcrypt.compare( pass, user.password)
                    .then( valid => {
                        if ( !valid ) {
                            res.status(201).json({
                                message: `Invalid password, try again!`
                            });
                        } else {
                            const token = jwt.sign(
                                { userId: user._id,
                                    user: user.user,
                                    email: user.email,
                                    userType: user.userType
                                
                                },
                                process.env.JWT_KEY,
                                { expiresIn: '1h' }
                            );
                            res.status(200).json({
                                message: 'Logged!',
                                token: token
                            });
                        }
                    })
                    .catch( err => {
                        console.log(err)
                        res.status(500).json({
                            error: `\nError: ${err}\n`
                        })
                    });
            }

        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: `\nError: ${err}\n`
            })
        })
}

exports.forgotPass = (req, res, next) => {
    const errors = validationResult(req)
    const mail = req.body.email
    const pass = req.body.password

    if ( !errors.isEmpty() ) {
        return res.status(422).json({
            error: errors.array()
        })
    }

    const newPass = bcrypt.hashSync( pass, 10 );

    User.findOneAndUpdate( {email: mail},
        { $set: { password: newPass }},
        { new: true })
        .then( updatedUser => {
            console.log(updatedUser)
            res.status(200).json({
                message: `Password changed successfully!`
            });
        })
        .catch( err => {
            res.status(500).json({
                error: err
            });
        })
}