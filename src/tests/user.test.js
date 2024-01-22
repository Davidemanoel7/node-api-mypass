const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../app');
const Test = require('supertest/lib/test');
require('dotenv').config();


beforeEach( async() => {
    try {
        await mongoose.connect( process.env.DATA_BASE );
        console.log('\n\t=> Connected!\n')
    } catch ( error ){
        console.log(`\nError: ${error}`)
        throw error;
    }
});

describe('Login', () => {
    try {
        test( 'should return 200 if valid credentials', async () => {
            return request(app)
                .post("http://localhost:3000/v1/auth/signin")
                .send({
                    user: "crowzin",
                    password: "pass123"
                })
                .expect(200)
                .then(result => {
                    expect(result.statusCode).toBe(200)
                    console.log(result)
                    console.log("passed")
                })
        })
    } catch (error) {
        console.log(error)
        throw error
    }
})

afterEach(async() => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
    console.log('Data base closed');
});