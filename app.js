const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')

// const mongoose = require('mongoose')

const userRoutes = require('./api/routes/users')
const passRoutes = require('./api/routes/pass')

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://AdminMyPass:" + process.env.MONGO_ATLAS_PASS + "@node-rest-mypass.pvhuw2o.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
}
run().catch(console.dir);

  //connecting to mongoDB with mongoose
// mongoose.connect(
//     "mongodb+srv://AdminMyPass:"+process.env.MONGO_ATLAS_PASS+"@node-rest-mypass.pvhuw2o.mongodb.net/?retryWrites=true&w=majority",
//     // {
//     //     useMongoClient: true
//     // }
//     )

app.use(morgan('dev'))
app.use(bodyParser.urlencoded( {extended: false} ))
app.use(bodyParser.json())

app.use((req, res, next) => {
    // Restringir o acesso da API
    res.header('Access-Control-Allow-Origin', '*')
    
    // Tratar erros de CORS
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    
    // 
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({

        })
    }
    next()
})

// Routes which should handle requests
app.use('/users', userRoutes)
app.use('/pass', passRoutes)

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

module.exports = app

//https://youtube.com/playlist?list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q

// https://youtu.be/WDrU305J1yw?si=z3oP8rA3QnuKX3FR&t=740



// FALTA CONECTAR AO BANCO DE DADOS
// https://cloud.mongodb.com/v2/6519d83342a4ea21b3725ac5#/clusters/connect?clusterId=node-rest-mypass