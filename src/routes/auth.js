const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const User = require('../models/users')
const bcrypt = require('bcryptjs')

const { body, validationResult } = require('express-validator')

const jwt = require('jsonwebtoken')

router.get('/signin/', (req, res, next) => {
    const usr = req.body.user

    User.findOne({ user: usr, living: true })
        .then( user => {
            if ( !user ) {
                return res.status(404).json({
                    message: `Usuário ${req.body.user} não encontrado`
                })
            } else {
                bcrypt.compare(req.body.pass, user.password)
                .then( valid => {
                    if ( !valid ) {
                        res.status(201).json({
                            message: `Invalid password, try again!`
                        })
                    } else {
                        const token = jwt.sign(
                            { userId: user._id, user: user.user, email: user.email, userType: user.userType },
                            process.env.JWT_KEY,
                            { expiresIn: '1h' }
                        )
                        // console.log(`\t\nLogged! jwt token: ${token}\n`)
                        res.status(200).json({
                            message: `Logged!`,
                            token: token
                        })
                    }
                })
                .catch( err => {
                    console.log(err)
                    res.status(500).json({
                        error: `\nerror: ${err}\n`
                    })
                })
            }
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: `\nerror: ${err}\n`
            })
        })
})

router.patch('/forgotPass/', [
    body('email').isEmail(),
    body('password').isString().isLength({ min: 6 , max: 20 })
], ( req, res, next ) => {

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
})

module.exports = router;