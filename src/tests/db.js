const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// create (in memory) database
const connect = async () => {
    try {
        await mongoose.disconnect();

        mongoServer = await MongoMemoryServer.create();
        const mongoUri = await mongoServer.getUri();
        await mongoose.connect(mongoUri);

        console.log("\n\t[TEST] Data base connected! 🔑\n")
    } catch (error) {
        console.log(error)
        throw error;
    }
}

// remove and close this database
const close = async () => {
    try {
        await mongoose.disconnect();
        await mongoServer.stop();
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// clear all data from database
const clear = async () => {
    const collections = mongoose.connection.collections;

    for ( const key in collections){
        await collections[key].deleteMany();
    }
    console.log('\n# Database cleared!\n')
}

module.exports = {
    connect,
    close,
    clear,
}