require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/users');
const Pass = require('../models/pass');

const jwt = require('jsonwebtoken');

const validationMidd = require('../middleware/validationMidw');

exports.signup = [validationMidd.validate, async (req, res, next) => {
    try {
        const hashedPass = bcrypt.hashSync( req.body.password, 10 );
        if ( !hashedPass ) {
            return res.status(500).json({
                message: "Error while hashing your password. Try again!"
            })
        }
        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            user: req.body.user,
            email: req.body.email,
            password: hashedPass,
            userType: req.body.userType
        });

        if ( !user ) {
            return res.status(409).json({
                message: 'Email already exists. Please try a different e-mail'
            })
        }

        await user.save();

        const token = jwt.sign(
            {
                userId: user._id,
                user: user.user,
                email: user.email,
                userType: user.userType
            },
            process.env.JWT_KEY,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: `Created user ${user.user} successfully`,
            createdUser: {
                id: user._id,
                name: user.name,
                user: user.user,
                email: user.email,
            },
            token: token
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err,
            message: `Cannot save this user... please try again :(`
        });
    }
}];

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('_id name user email').exec();

        res.status(200).json({
            count: users.length,
            users: users
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        });
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const id = req.userData.userId
        const user = await User.findOne({_id: id})
            .select('_id name user email profileImage living')
            .exec()

        if ( user && user.living ) {
            res.status(200).json(user);
        } else {
            res.status(404).json({
                message: "User not found or invalid"
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json( {error: err || 'Internal server error...'} )
    }
}

exports.updateUser = [ validationMidd.validate, async (req, res, next) => {
    try {
        const id = req.userData.userId
        const user = await User.findByIdAndUpdate( id ,
            { $set: {
                name: req.body.name,
                user: req.body.user,
                email: req.body.email,
            }},
            { new: true } 
        );

        if ( !user ) {
            return res.status(404).json({
                message: `User not found with ID ${id}`
            })
        }

        res.status(200).json({
            message: `Updated user ${user.user} successfully`,
            updatedUser : user,
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: `${err} Internal server error`
        })
    }
}];

exports.deleteUser = async (req, res, next) => {
    try {
        const id = req.userData.userId
        const user = await User.findOneAndDelete({ _id: id }).exec();

        if ( !user ) {
            return res.status(404).json({
                message: `User by ID ${id} not found.`
            });
        }

        await Pass.deleteMany({ userId: id });

        res.status(200).json({
            message: `User ${user.user} deleted successfully`,
        });

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: `${err} or Internal server error`
        })
    }
}

exports.inactivateUser = async (req, res, next) => {
    try {
        const id = req.userData.userId
        const user = await User.findByIdAndUpdate( id, 
            { $set: { living: false }},
            { new: true }
        );

        if ( !user ) {
            return res.status(404).json({
                message: `User by ID ${id} not found.`
            });
        }

        res.status(200).json({
            user: user,
            message: `User ${user.user} inactivated successfully!`
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })   
    }
}

exports.changeUserPass = [ validationMidd.validate, async (req, res, next) => {
    try {
        const id = req.userData.userId
        const newPass = bcrypt.hashSync( req.body.password, 10);

        const user = await User.findByIdAndUpdate( id, 
            { $set: { password: newPass }},
            { new: true });
        
        if ( !user ) {
            return res.status(404).json({
                message: `User not found with ID ${id}`
            });
        }

        res.status(200).json({
            message: 'Password changed successfully!'
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: `${err} Internal server error`
        })
    }
}];

exports.changeUserProfileImage = async (req, res, next) => {
    try {
        const id = req.userData.userId;
        const user = await User.findByIdAndUpdate( id,
            { $set: { profileImage: req.file.path }},
            { new: true });
        
        if ( !user ) {
            return res.status(404).json({
                message: `User not found with ID ${id}`
            })
        }

        res.status(200).json({
            message: `Profile image changed from user ${user.user}!`
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err,
            message: `Cannot change profile image :(`
        });        
    }
};

