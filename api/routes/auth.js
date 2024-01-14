const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const User = require('../models/users')
const bcrypt = require('bcryptjs')

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
                        console.log(`Eq: ${req.body.pass} = ${valid}`)
                        res.status(201).json({
                            message: `Invalid password, try again!`
                        })
                    } else {
                        const token = jwt.sign(
                            { email: user.email, userId: user._id },
                            process.env.JWT_KEY,
                            { expiresIn: '1h' }
                        )
                        console.log(`\ntoken: ${token}\n`)
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

async function validateUser(pass, hash) {
    bcrypt
        .compare(pass, hash)
        .then( res => {
            if ( res ) {
                return true;
            }
            return false;
        })
        .catch( err => console.error(err.message) )
}

module.exports = router;