const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    user: String,
    email: String,
    password: String,
})

module.exports = mongoose.model('User', userSchema)