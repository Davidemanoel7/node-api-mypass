const multer = require('multer');
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
    if( file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        callback(null, true);
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