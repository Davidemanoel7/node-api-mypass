const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount');

const fireBaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://my-pass-store-images.appspot.com'
});

module.exports = fireBaseAdmin;