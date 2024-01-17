const jwt = require('jsonwebtoken');

const checkAuth = (userType) => {
    return ( req, res, next ) => {
        try {
            const token = req.headers.authorization.split(' ')[1];

            if ( !token ) {
                throw new Error('Auth failed. Token missing or invalid format.');
            }
            // console.log(`\n token: ${token}\n`);
            const decoded = jwt.verify(token, process.env.JWT_KEY)

            if ( !userType.includes(decoded.userType) ) {
                throw new Error(`Auth failed. User doesn't have required permissions.`);
            }

            if ( req.params.userId !== decoded.userId && decoded.userType === 'common'){
                throw new Error(`Auth failed. Actions on other users are not allowed.`)
            }

            req.userData = decoded;
            next();

        } catch ( err ) {
            console.log(err)
            res.status(401).json({
                message: `Auth failed. Invalid token or insufficient permissions.`,
                error: err
            })
        }
    }
}

const checkCommonAuth = checkAuth(['common'])
const checkAdminAuth = checkAuth(['admin'])
const checkAllowAuth = checkAuth(['admin', 'common'])

module.exports = {
    checkCommonAuth,
    checkAdminAuth,
    checkAllowAuth
}