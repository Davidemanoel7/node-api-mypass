require('dotenv').config()
const crypto = require('crypto');

function encryptString(text) {
    const secretKey = process.env.SECRETKEY
    const algorithm = process.env.ALGORITHM

    const iv = crypto.randomBytes(16); // Initialization Vector
    const key = crypto.scryptSync(secretKey, 'salt', 32); // Derivar uma chave usando scrypt

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    
    encrypted += cipher.final('hex');

    return {
        iv: iv.toString('hex'),
        encryptedText: encrypted
    };
}

function decryptString(encryptedData) {
    const secretKey = process.env.SECRETKEY
    const algorithm = process.env.ALGORITHM;

    const iv = Buffer.from(encryptedData.iv, 'hex');
    const key = crypto.scryptSync(secretKey, 'salt', 32);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedData.encryptedText, 'hex', 'utf-8');
    
    decrypted += decipher.final('utf-8');

    return decrypted;
}

module.exports = {
    encryptString,
    decryptString,
}