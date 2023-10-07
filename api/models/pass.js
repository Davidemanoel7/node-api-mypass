const mongoose = require('mongoose');

const passSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    description: String,
    password: String,
    userId: mongoose.Schema.Types.ObjectId
})