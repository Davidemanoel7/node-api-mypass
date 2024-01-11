const express = require('express')

const router = express.Router()

const mongoose = require('mongoose')

const Pass = require('../models/pass')
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
                valid = validateUser( result.password, req.body.pass)
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
//edgar66
//thatssuc
async function validateUser(hash, passW) {
    bcrypt
        .compare(passW, hash)
        .then(res => {
            console.log(res) // return true
        })
        .catch(err => console.error(err.message))
}

/*

Talvez a rota de validação de senha deva ser algo como /validate/:pass

e a busca nas senhas deva ser do tipo:
Pass.find({password: pass})

porém, deveríamos comparar se a senha pertence a algum usuário e se é válida, com o resultado da busca anterior:


Pass.find({password: pass}) //Buscando alguma senha igual a informada
    .then( result => {
        console.log(result)
        if (!result) {
            res.status(404).json({
                message: `Pass not found`
            })
        }
        User.findById(result.userId) //Buscando algum usuário com a senha informada
            .then( user => {
                console.log(user)
                if (!user) {
                    res.status(404).json({
                        message: `User not found`
                    })
                }

                // Comparando se o usuário e senhas informados são válidos.
                if (user.user == req.body.user) and (result.password == req.body.pass) {
                    res.status(200).json({
                        message: `Logged in`
                    })
                }

            })
})
*/

module.exports = router;