
const multer = require("multer");

const dontStorageUpload = multer({ dest: './tmp/' })

module.exports = { dontStorageUpload };