const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const validationMidd = require('../middleware/validationMidw');

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const nodemailConfig = require('../config/nodemailConfig');

exports.sigIn = (req, res, next) => {
    const usr = req.body.user
    const pass = req.body.password

    User.findOne({ user: usr })
        .then( user => {
            if ( !user ) {
                return res.status(404).json({
                    message: `User ${usr} not found`
                });
            } else {
                if ( !user.living ) {
                    user.living = true
                    user.save()
                        .then( res => {
                            console.log(res)
                        })
                        .catch( err => {
                            console.log(err)
                        })
                }
                bcrypt.compare( pass, user.password)
                    .then( valid => {
                        if ( !valid ) {
                            res.status(401).json({
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
                                { expiresIn: '24h' }
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
};

exports.forgotPass = [ validationMidd.validate, (req, res, next) => {
    const mail = req.body.email
    
    const token = crypto.randomBytes(20).toString('hex')
    
    User.findOneAndUpdate( {email: mail},
        { $set: {
            resetPassToken: token,
            resetPassExpires: Date.now() + 3600000
        }},
        )
        .then( usr => {
            if ( !usr ) {
                return res.status(404).json({
                    message: `User with email: ${mail} not found.`
                })
            }

            const transport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: nodemailConfig.email,
                    pass: nodemailConfig.pass
                }
            });
            const mailSended = {
                from: nodemailConfig.email,
                to: mail,
                subject: '[MyPass] Forgot Password 🔑',
                text: `You are accepting this email because you requested password recovery.\n\n` +
                        `Click the following link or paste it into your browser to complete the process:\n\n` +
                        `http://localhost:3000/v1/auth/resetPass/${token}\n\n\n` +
                        `📌If you have not requested password recovery, please ignore this email.\n\n` +
                        `📌 please, no reply this email.`
            }

            transport.sendMail( mailSended, (err, info) => {
                if ( err ) {
                    console.log(err)
                    return res.status(500).json({
                        message: 'Error to send email'
                    })
                }
                res.status(200).json({
                    info: info,
                    message: '\nRecovery email sent, check your inbox!\n[Recovery link has expires in 1 hour]\n'
                })
            })
        })
        .catch( err => {
            console.log(`\nError: ${err}\n`)
            res.status(500).json({
                error: err
            });
        })
}];

exports.resetPass = [ validationMidd.validate, (req, res, next) => {
    const token = req.params.token;

    const newPass = bcrypt.hashSync( req.body.password, 10 );

    User.findOneAndUpdate({
                resetPassToken: token, //Vefiricando se o token de reset é o mesmo
                resetPassExpires: { $gt: Date.now() } // $gt (greater than) verifica se resetPassExpires é maior que o momento atual
            },
            { $set: {
                password: newPass,
                resetPassToken: null,
                resetPassExpires: null
            }},
            { new: true }
        )
        .then( usr =>{
            console.log(`\nUser: ${usr}\n`)
            if (!usr) {
                return res.status(404).json({
                    message: `Token expired or invalid.`
                })
            }
            res.status(200).json({
                message: 'Password changed successfully!'
            })
        })
        .catch( err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
}];

exports.checkSecurity = [ validationMidd.validate, (req, res, next) => {
    const id = req.params.userId
    const pass = req.body.password

    User.findById(id)
        .then( usr => {
            let check = bcrypt.compareSync( pass, usr.password )
            if ( !check ) {
                return res.status(401).json({
                    message: `Unauthorized. invalid password`
                })
            }
            res.status(200).json({
                message: `Authorized`
            });
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}];