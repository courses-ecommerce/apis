
const multer = require("multer");

// const dontStorageUpload = multer({ dest: './tmp/' })
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './tmp/')
    },
    filename: function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, file.fieldname + '-' + Date.now() + '.' + extension)
    }
})

const dontStorageUpload = multer({ storage: storage })

module.exports = { dontStorageUpload };