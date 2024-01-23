const db = require('./db');
const request = require('supertest');
const app = require('../app');

const agent = request.agent(app);

beforeAll( async () => {
    try {
        await db.connect();
    } catch (error) {
        
    }
});

beforeEach( async () => {
    try {
        await db.clear();
    } catch ( error ){
        throw error;
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

describe( 'Login', () => {
    test('Should return 200 if valid credentials', done => {
            agent
            .post('/v1/auth/signin/')
            .type("application/json")
            .send({
                user: "crowzin",
                password: "pass123"
            })
            .expect(200)
            .then( res => {
                expect(res.statusCode).toBe(200);
                done();
            })
    })
})

// describe('Login', () => {
//     try {
//         test( 'should return 200 if valid credentials', async () => {
//             return request("http://localhost:3000")
//                 .post("/v1/auth/signin/")
//                 .type("application/json")
//                 .send({
//                     user: "crowzin",
//                     password: "pass123"
//                 })
//                 .then(result => {
//                     expect(result.statusCode).toBe(200)
//                     token = result.body.token
//                     console.log(token)
//                 })
//         })
//     } catch (error) {
//         console.error(error)
//         throw error
//     }
// })