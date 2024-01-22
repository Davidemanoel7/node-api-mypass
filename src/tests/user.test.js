const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../app');
require('dotenv').config();


beforeEach( async() => {
    try {
        const dbUri = process.env.DATA_BASE
        await mongoose.connect(dbUri);
        console.log('\n\t=> Connected!\n')
    } catch ( error ){
        console.log(`\nError: ${error}`)
        throw error;
    }
});

describe('POST /v1/auth/signin/', () => {
    try {
        it( 'should return 200 if valid credentials', async () => {
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
    await mongoose.connection.close();
    console.log('Data base closed');
});