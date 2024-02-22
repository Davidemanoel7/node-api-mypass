require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');

// Configurando a promessa global do Mongoose
mongoose.Promise = global.Promise;

const mongoUrl = process.env.DATA_BASE_TEST;

mongoose.connect(mongoUrl)
    .then( () => console.log('\n📦 Database connected\n') )
    .catch(err => console.error('\nError connecting to database: \n', err ));

const app = express();
const port = process.env.PORT || 3000;

// Middleware para fazer o parse do corpo da requisição
app.use(express.json());

// Rotas que devem lidar com as requisições
const userRoutes = require('./routes/userRoutes');
const passRoutes = require('./routes/passRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/v1/user/', userRoutes);
app.use('/v1/pass/', passRoutes);
app.use('/v1/auth/', authRoutes);

app.use('/', (req, res) => {
    return res.status(200).json({
        message: 'Hello'
    });
})

app.listen(port, () => {
    console.log(`Server started at ${port}`);
});

module.exports = app