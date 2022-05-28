const VerifyModel = require('../models/users/verify.model');
const constants = require('../constants/index');
const { cloudinary } = require('../configs/cloudinary.config');
const urlSlug = require('url-slug')
const CartModel = require('../models/users/cart.model');
const CourseModel = require('../models/courses/course.model')
const CouponModel = require('../models/coupon.model')


// fn: upload image to cloudinary
const uploadImageToCloudinary = async (imageFile, name, folder = "thumbnail") => {
    try {
        let slug = urlSlug(name)
        const result = await cloudinary.uploader.upload(imageFile.path, {
            folder: folder,
            public_id: `${slug}`,
            upload_preset: folder // chỉnh sửa size ảnh cho phù hợp 
        })
        const { secure_url } = result;
        return secure_url;
    } catch (error) {
        if (folder == "thumbnail") {
            return 'https://res.cloudinary.com/uthcmc/image/upload/v1653155326/thumbnail/l3g5x9yl.png';
        } else {
            return 'https://res.cloudinary.com/uthcmc/image/upload/v1653154696/avatar/l3g5jrl7.png';
        }
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

// fn: xoá resoure bằng public id
const destroyResoureInCloudinary = async (name, resource_type) => {
    try {
        const result = await cloudinary.uploader.destroy(name, { resource_type: resource_type })
        return result
    } catch (error) {
        return error
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


//fn: kiểm tra mã giảm giá cho khoá học
const hanlderApplyDiscountCode = (course, coupon) => {
    try {
        // kiểm tra hết hạn
        const isExpired = new Date(coupon.expireDate) < new Date()
        if (isExpired) {
            return { isApply: false, discountAmount: 0, message: "mã hết hạn" }
        }
        // giá tối tiểu <= giá khoá học && số lượng >= 1
        let message = "không đủ điều kiện"
        let isApply = coupon.minPrice <= course.currentPrice && (coupon.number >= 1 || coupon.number === null)
        // kiểm tra loại áp dung
        switch (coupon.apply.to) {
            case 'all':
                break
            case 'author':
                // tác giả mã == tác giả khoá học && giá tối tiểu <= giá khoá học && số lượng >= 1
                isApply = JSON.stringify(coupon.author) == JSON.stringify(course.author._id) && isApply
                break
            case 'category':
                // giá trị loại danh mục "có" danh mục khoá học &&  giá tối tiểu <= giá khoá học && số lượng >= 1
                isApply = coupon.apply.value.some(item => JSON.stringify(item) == JSON.stringify(course.category)) && isApply
                break
            default:
                isApply = false
        }
        // tính tiền giảm nếu áp dụng thành công
        let discountAmount = 0
        if (isApply) {
            message = "ok"
            // tính tiền giảm giá theo tiền mặt và giảm giá %
            discountAmount = coupon.type === 'money' ? coupon.amount : coupon.amount * course.currentPrice / 100
            // tiền giảm giá có vượt giá trị giảm tối đa ?
            if (discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount
            }
        }

        return { isApply, discountAmount, message }
    } catch (error) {
        console.log(error);
        return { isApply: false, discountAmount: 0, message: "mã hết hạn" }
    }
}


module.exports = {
    generateVerifyCode,
    isVerifyEmail,
    uploadImageToCloudinary,
    hanlderApplyDiscountCode
};
