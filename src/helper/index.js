const VerifyModel = require('../models/users/verify.model');
const constants = require('../constants/index');
const { cloudinary } = require('../configs/cloudinary.config');

// fn: upload image to cloudinary
const uploadImageToCloudinary = async (imageFile, name) => {
    try {
        let slug = urlSlug(name)
        const result = await cloudinary.uploader.upload(imageFile.path, {
            folder: `thumbnail`,
            public_id: `${slug}`
        })
        const { secure_url } = result;
        return secure_url;
    } catch (error) {
        throw error
    }
}

// fn: upload video to cloudinary
const uploadVideoToCloudinary = async (video, id) => {
    try {
        cloudinary.uploader.upload_large(video.path, {
            resource_type: 'video',
            public_id: `videos/${id}`,

        })
    } catch (error) {

    }
}


//fn: tạo mã xác thực
const generateVerifyCode = (numberOfDigits) => {
    //random một số từ 1 -> 10^numberOfDigits
    const n = parseInt(numberOfDigits);
    const number = Math.floor(Math.random() * Math.pow(10, n)) + 1;
    let numberStr = number.toString();
    const l = numberStr.length;
    for (let i = 0; i < 6 - l; ++i) {
        numberStr = '0' + numberStr;
    }
    return numberStr;
};

//fn: kiểm tra mã xác thực
const isVerifyEmail = async (email, verifyCode) => {
    try {
        const res = await VerifyModel.findOne({ email });
        if (res) {
            const { code, dateCreated } = res;
            if (code !== verifyCode) return false;
            const now = Date.now();
            // kiểm tra mã còn hiệu lực hay không
            if (now - dateCreated > constants.VERIFY_CODE_TIME_MILLISECONDS)
                return false;
            return true;
        }
        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
};


module.exports = {
    generateVerifyCode,
    isVerifyEmail,
    uploadImageToCloudinary,
};
