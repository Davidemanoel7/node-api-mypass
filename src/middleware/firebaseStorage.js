const fireBaseAdmin = require('../config/firebase');
const fs = require('fs');


const uploadImage = async ( reqFile, destination ) => {
    try {
        const bucket = fireBaseAdmin.storage().bucket();
        const uploaded = await bucket.upload( reqFile.path, {
            destination: `profile/${destination}`,
            metadata: {
                contentType: reqFile.mimetype
            }
        });
        if ( !uploaded ) {
            return false;
        }
        // deletando o arquivo em /uploads após upload no firebase:
        fs.unlinkSync(reqFile.path);

        return true;

    } catch (error) {
        console.log(error);
        return false;
    }
}

const downLoadImage = async ( pathToFileName ) => {
    try {
        const bucket = fireBaseAdmin.storage().bucket();
        const file = bucket.file(`${pathToFileName}`);
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 3600 * 24 * 7
        });

        if ( !url ) {
            return null;
        }

        return url;

    } catch (error) {
        console.log(error)
        return null;
    }
}

module.exports = {
    uploadImage,
    downLoadImage
}