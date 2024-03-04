require('dotenv').config();
const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const validationMidd = require('../middleware/validationMidw');

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const nodemailConfig = require('../config/nodemailConfig');

exports.sigIn = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });

        if ( !user ) {
            res.status(404).json({
                message: `User with email: ${email} not found`
            })
        }

        if ( !user.living ) {
            user.living = true;
            await user.save();
        }

        const validPass = await bcrypt.compare( password, user.password );

        if ( !validPass ) {
            return res.status(401).json({
                message: "Invalid password. Try again!"
            });
        }

        const token = jwt.sign({
            userId: user._id,
            user: user.user,
            email: user.email,
            userType: user.userType
        },
            process.env.JWT_KEY,
            { expiresIn: '24h'}
        );

        res.status(200).json({
            message: "Logged!",
            token: token
        })
    } catch (error) {
        console.log(error);
        if ( error.name == 'ValidationError') {
            return res.status(400).json({
                error: err.message
            });
        }

        res.status(500).json({
            error: "Internal Server Error."
        });
    }
};

exports.forgotPass = [ validationMidd.validate, async (req, res, next) => {
    try {
        const token = crypto.randomBytes(20).toString('hex')
        const email = req.body.email;
        const user = await User.findOneAndUpdate(
            { email: email },
            { $set: {
                resetPassToken: token,
                resetPassExpires: Date.now() + 3600000    
            }},
        )

        if ( !user ) {
            return res.status(404).json({
                message: `User with email: ${email} not found.`
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
            to: user.email,
            subject: '[MyPass] Forgot Password 🔑',
            text: `You are accepting this email because you requested password recovery.\n\n` +
                    `Click the following link or paste it into your browser to complete the process:\n\n` +
                    `https://mypass-api.onrender.com/v1/auth/resetPass/${token}\n\n\n` +
                    `📌 If you have not requested password recovery, please ignore this email.\n\n` +
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
                message: 'Recovery email sent, check your inbox! [Recovery link has expires in 1 hour]'
            })
        })

    } catch (error) {
        console.log(`\nError: ${error}\n`)
        res.status(500).json({
            error: error
        });   
    }
}];

exports.resetPass = [ validationMidd.validate, async (req, res, next) => {
    const token = req.query.token;

    const newPass = bcrypt.hashSync( req.body.password, 10 );

    try {
        const user = await User.findOneAndUpdate({
            resetPassToken: token,
            resetPassExpires: { $gt: Date.now() } // $gt (greater than) verifica se resetPassExpires é maior que o momento atual
            },
            { $set: {
                password: newPass,
                resetPassToken: null,
                resetPassExpires: null
            }},
            { new: true }
        );

        if ( !user ) {
            return res.status(404).json({
                message: `Token expired or invalid.`
            })
        }
        res.status(200).json({
            message: 'Password changed successfully!'
        })

    } catch (error) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }        
}];

exports.checkSecurity = [ validationMidd.validate, async (req, res, next) => {
    const { userId } = req.userData;
    const pass = req.body.password;

    try {
        const user = await User.findById( userId );

        let check = bcrypt.compareSync( pass, user.password );
        if ( !check ) {
            return res.status(401).json({
                message: `Unauthorized. invalid password`
            })
        }

        res.status(200).json({
            message: "Authorized"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message
        })
    }
}];