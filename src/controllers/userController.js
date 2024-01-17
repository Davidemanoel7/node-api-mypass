const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/users');

const { validationResult } = require('express-validator');

exports.signup = (req, res, next) => {
    const validRes = validationResult(req);

    if (!validRes.isEmpty()) {
        return res.status(422).json({
            message: `Oops... error in ${validRes.errors[0].param} field with value: ${validRes.errors[0].value}. Try again!`,
            errors: validRes.array()
        });
    }

    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({
                error: err,
            });
        } else {
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                name: req.body.name,
                user: req.body.user,
                email: req.body.email,
                password: hash,
                userType: req.body.userType
            });
            user.save()
                .then(result => {
                    console.log(result);
                    res.status(201).json({
                        message: `Created user ${result.user} successfully`,
                        createdUser: {
                            id: result._id,
                            name: result.name,
                            user: result.user,
                            email: result.email,
                            request: {
                                type: "GET",
                                url: `users/${result.user}/`,
                            }
                        },
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err,
                        message: `Cannot save this user... please try again :(`
                    });
                });
        }
    });
};

exports.getAllUsers = (req, res, next) => {
    User.find()
        .select('_id name user email')
        .exec()
        .then( docs => {
            const response = {
                count: docs.length,
                users: docs
            };
            res.status(200).json(response);
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

exports.getUserById = (req, res, next) => {
    const id = req.params.userId

    User.findOne({_id: id})
        .select('_id name user email profileImage living')
        .exec()
        .then( doc => {
            if ( doc && doc.living ) {
                res.status(200).json({
                    user: doc,
                    requests: {
                        type: "PATCH/DELETE",
                        url: `/users/${doc._id}`
                    }
                })
            } else {
                res.status(404).json({
                    message: `User not found or invalid ${usr}`
                })
            }
        })
        .catch( err => {
            console.log(err)
            res.status(500).json( {error: err || 'Internal server error...'} )
        })
}

exports.updateUserById = (req, res, next) => {
    const id = req.params.userId

    const errors = validationResult(req);

    if ( !errors.isEmpty() ) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    User.findByIdAndUpdate( id,
                    { $set: {
                        name: req.body.name,
                        user: req.body.user,
                        email: req.body.email,
                    }},
                    { new: true })
                    .then( result => {
                        console.log(result);
                        res.status(200).json({
                            message: `Updated user ${result.user} successfully`,
                            updatedUser : result,
                            request: {
                                type: 'GET/',
                                url: `/users/${result.user}`
                            }
                        })
                    })
                    .catch( err => res.status(500).json({
                        message: `User not found by ID:${req.params.userId}...`,
                        error: err
                    }))
}

exports.deleteUserById = (req, res, next) => {
    const id = req.params.userId

    User.findByIdAndDelete({_id: id})
        .exec()
        .then( result => {
            res.status(200).json({
                message: `User ${result.user} deleted successfully`,
                deletedUser: result
            })
        })
        .catch( err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

exports.inactivateUserById = (req, res, next) => {
    const id = req.params.userId

    User.findByIdAndUpdate(id,
        { $set: { living: false }},
        { new: true })
        .then( usr => {
            if (!usr) {
                return res.status(404).json({
                    message: 'User not found'
                })
            }

            console.log(usr)
            res.status(200).json({
                user: usr,
                message: `User ${usr.name} inactivated successfully!`
            })
        })
        .catch( err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.activateUserById = (req, res, next) => {
    const id = req.params.userId

    User.findByIdAndUpdate(id,
        { $set: { living: true }},
        { new: true })
        .then( usr => {
            if (!usr) {
                return res.status(404).json({
                    message: 'User not found'
                })
            }

            console.log(usr)
            res.status(200).json({
                user: usr,
                message: `User ${usr.name} inactivated successfully!`
            })
        })
        .catch( err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.changeUserPass = (req, res, next) => {
    const id = req.params.userId
    const newPass = req.body.password

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        })
    }

    bcrypt.hash(newPass, 10, (err, hashed) => {
        if (err) {
            return res.status(500).json({
                error: err
            });
        }

        User.findByIdAndUpdate( id,
            { $set: { password: hashed }},
            { new: true }
            )
            .then( result => {
                res.status(200).json({
                    message: 'Password changed successfully!'
                })
            })
            .catch( err => {
                console.log(err)
                res.status(500).json({
                    error: err
                })
            })
    })
}

exports.changeUserProfileImage = (req, res, next) => {
    const id = req.params.userId;

    User.findByIdAndUpdate( id,
        { $set: { profileImage: req.file.path }},
        { new: true })
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: `Profile image changed from user ${result.user}!`,
                request: {
                    type: 'GET/',
                    url: `/users/${result.user}`
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err,
                message: `User by ID:${req.params.userId} not found OR Cannot change profile image :(`
            });
        });
};

