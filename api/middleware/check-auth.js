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
                throw new Error(`Auth failed. User dosn't have required permissions.`);
            }

            req.userData = decoded;
            next();

        } catch ( error ) {
            res.status(401).json({
                message: `Auth failed. Invalide token or insufficient permissions.`
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