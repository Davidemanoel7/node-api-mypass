const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const User = require('../models/users')
const bcrypt = require('bcryptjs')

router.get('/auth/', (req, res, next) => {
    // const id = req.params.passId

    User.find({user: req.body.user})
        .then( result => {
            if ( !result ){
                console.log(`\t\n${result.user}\n`)
                return res.status(404).json({
                    message: `Usuário ${req.body.user} não encontrado`
                })
            } else {
                valid = validateUser( req.body.pass, result.password )
                // console.log(result)
                .then( valid => {
                    console.log(valid)
                    if ( valid ) {
                        console.log(`Eq: ${req.body.pass} = ${valid}`)
                        res.status(200).json(valid)
                    }
                    res.status(201).json({
                        message: `username ou senha informados incorretamente...`
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
            console.log(res) // return true
        })
        .catch(err => console.error(err.message))
}

module.exports = router;