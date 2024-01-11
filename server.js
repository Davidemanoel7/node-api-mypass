require('dotenv').config()
const mongoUrl = process.env.DATA_BASE


const mongoose = require('mongoose')
const express = require('express')

const userRoutes = require('./api/routes/users')
const passRoutes = require('./api/routes/pass')
const authRoutes = require('./api/routes/auth')

// const app = require('./app')

const port = process.env.PORT || 3000

// const server = http.createServer(app)

mongoose.connect(mongoUrl)
const database= mongoose.connection

mongoose.promisse = global.promisse

database.on('connected', () => console.log('\n📦 Database connected\n'))

const app = express()

app.use(express.json())

// Routes which should handle requests
app.use('/users', userRoutes)
app.use('/pass', passRoutes)
app.use('/auth', authRoutes)

app.listen(port, () => {
    console.log(`Server started at ${port}`)
})