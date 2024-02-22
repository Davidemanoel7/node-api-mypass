require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors')

// Configurando a promessa global do Mongoose
mongoose.Promise = global.Promise;

const mongoUrl = process.env.DATA_BASE_TEST;
mongoose.connect(mongoUrl)
    .then( () => console.log('\n📦 Database connected\n') )
    .catch(err => console.error('\nError connecting to database: \n', err ));


// Middleware para fazer o parse do corpo da requisição
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

if ( process.env.NODE_ENV === 'dev') {
    const morgan = require('morgan');
    app.use( morgan('dev') );
}


app.use((req, res, next) => {
    // Restringir o acesso da API (nesse caso qualquer origem é aceita). '*' deverá ser substituído pela url da aplicação pós deploy.
    res.header('Access-Control-Allow-Origin', '*')
    
    // Tratar erros de CORS
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Rotas que devem lidar com as requisições
const userRoutes = require('./routes/userRoutes');
const passRoutes = require('./routes/passRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/v1/user/', userRoutes);
app.use('/v1/pass/', passRoutes);
app.use('/v1/auth/', authRoutes);

app.get('/', (req, res) => {
    res.send('Hello!');
});

app.use( (req, res, next) => {
    const error = new Error('Not Found :(');
    error.status = 404;
    next( error );
})

app.use( (error, req, res, next) => {
    res.status( error.status || 500 );
    res.json({
        error: {
            message: error.message
        }
    })
})

app.listen(port, () => {
    console.log(`Server started at ${port}`);
});

module.exports = app