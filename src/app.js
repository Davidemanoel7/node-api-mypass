// const express = require('express');
const app = require('./index.js')
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded( {extended: false} ));
app.use(bodyParser.json());
app.use(cors());

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


app.use((req, res, next) => {
    const error = new Error('Not found :( ')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message,

        }
    })
})