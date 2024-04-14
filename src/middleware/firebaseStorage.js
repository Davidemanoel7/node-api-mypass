const fireBaseAdmin = require('../config/firebase');
const fs = require('fs');


const uploadImage = async ( reqFile, fileName ) => {
    try {
        const destine = `profile/${ fileName }`
        const bucket = fireBaseAdmin.storage().bucket();

        const fileExists = await deleteFile( bucket, destine )
        if ( !fileExists ) {
            console.log(`File exists => ${fileExists}`)
        }

        const uploaded = await bucket.upload( reqFile.path, {
            destination: destine,
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

const deleteFile = async ( bucket, destination ) => {
    try {
        const file = await bucket.getFiles({
            prefix: destination
        });
        if ( !file ) {
            return false
        }
        await bucket.deleteFiles({
            prefix: destination
            },
            function( err ) {
                if ( err ) {
                    console.log(`Error: ${err}`)
                }
                return false
            }
        )
        return true
    } catch (error) {
        console.log(`Error: ${error}`)
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