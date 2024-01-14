const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const User = require('../models/users')
const bcrypt = require('bcryptjs')

router.get('/auth/', (req, res, next) => {
    const usr = req.body.user

    User.findOne({ user: usr, living: true })
        .then( result => {
            if ( !result ){
                return res.status(404).json({
                    message: `Usuário ${req.body.user} não encontrado`
                })
            } else {
                bcrypt.compare(req.body.pass, result.password)
                .then( valid => {
                    console.log(valid)
                    if ( !valid ) {
                        console.log(`Eq: ${req.body.pass} = ${valid}`)
                        res.status(201).json({
                            message: `Invalid password, try again!`
                        })
                    } else {
                        res.status(200).json({
                            message: `Logged!`
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