require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/users');
const crypto = require('crypto');

const passSchema = mongoose.Schema({
    url: {
        required: false,
        type: String
    },
    description: {
        required: false,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// Chave secreta para criptografia (substitua por algo mais seguro em produção)
const secretKey = process.env.SECRETKEY;

// Middleware para criptografar a senha antes de salvar no banco de dados
passSchema.pre('save', function(next) {
    try {
        const cipher = crypto.createCipher('aes-256-ctr', secretKey);
        let encryptedPassword = cipher.update(this.password, 'utf8', 'hex');
        encryptedPassword += cipher.final('hex');
        this.password = encryptedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Método para descriptografar a senha
passSchema.methods.decryptPassword = function() {
    const decipher = crypto.createDecipher('aes-256-ctr', secretKey);
    let decryptedPassword = decipher.update(this.password, 'hex', 'utf8');
    decryptedPassword += decipher.final('utf8');
    return decryptedPassword;
};

module.exports = mongoose.model('Pass', passSchema);
