const multer = require('multer');
const path = require('path');
// const { options } = require('./auth')


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads');
    },
    filename: (req, file, callback) => {
        callback(null, new Date().toISOString() + file.originalname)
    }
})

const fileFilter = (req, file, callback) => {
    if( file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        const ext = path.extname(file.originalname).toLowerCase();
        if ( ext === '.jpg' || ext === '.jpeg' || ext === '.png' ) {
            callback( null, true );
        } else {
            callback(new Error('Only .jpg, .jpeg, or .png files are allowed'), false);
        }
    } else {
        callback(new Error('image type or size not supported'), false)
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter,
})

module.exports = upload;