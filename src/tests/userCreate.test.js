const db = require('./db');
const request = require('supertest');
const app = require('../app');

// const agent = request.agent(app);

beforeAll( async () => {
    try {
        await db.connect();
    } catch (err) {
        console.log(err)
        throw err;
    }
});

afterEach( async () => {
    try {
        await db.clear();
    } catch ( err ){
        throw err;
    }
});

afterAll( async () => {
    try {
        await db.close();
    } catch ( err ) {
        console.log(err)
        throw err;
    }
});

describe( 'Create user', () => {
    test('Should return 201 (create) if valid credentials and user not exists', async () => {
        try {
            request(app)
                .post(`/signup`)
                .type("application/json")
                .send({
                    name:"Mongo Memory Test",
                    email: "mongo@test.com",
                    user: "mongo",
                    password: "pass123"
                })
                .then( result => {
                    console.debug(result)
                    expect(result.statusCode).toBe(201);
                })
        } catch (error) {
            console.log(error);
            throw error;
        }
    });
});