require('dotenv').config();
const jwt = require('jsonwebtoken');

const checkAuth = ( req, res, next ) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        
        if ( !/^Bearer\s/.test(req.headers.authorization) || !token ) {
            return res.status(401).json({
                message: `Token missing or invalid format. Need Bearer Token format`
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY)

        req.userData = decoded;
        next();

    } catch ( err ) {
        console.log(err)
        if ( err.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: `Auth failed. ${err.message}. `
            })
        }
        res.status(401).json({
            error: err.message
        })
    }
}

module.exports = {
    checkAuth
}