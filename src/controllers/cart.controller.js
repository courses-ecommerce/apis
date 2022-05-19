const CartModel = require('../models/users/cart.model');
const CourseModel = require('../models/courses/course.model')
const CouponModel = require('../models/coupon.model')
const helper = require('../helper/index');




// fn: thêm khoá học vào giỏ hàng
const postCart = async (req, res, next) => {
    try {
        const { course, coupon } = req.body
        const { user } = req
        // kiểm tra khoá học
        const hadCourse = await CourseModel.findById(course).lean()
        if (!hadCourse) return res.status(400).json({ message: "mã khoá học không hợp lệ" })
        // kiểm tra có trong giỏ chưa
        const inCart = await CartModel.findOne({ user: user._id, course }).lean()
        if (inCart) {
            return res.status(400).json({ message: "khoá học đã trong giỏ hàng" })
        }
        // kiểm tra mã giảm giá đã thêm vào giỏ chưa
        const addedCode = await CartModel.findOne({ coupon })
        if (!addedCode) {
            // thêm khoá học vào giỏ hàng
            await CartModel.create({ user: user._id, course, coupon })
        } else {
            await CartModel.create({ user: user._id, course })
        }

        res.status(201).json({ message: "oke" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error" })
    }
}


// fn: lấy thông tin giỏ hàng
const getCart = async (req, res, next) => {
    try {
        const { user } = req

        // lấy giỏ hàng
        const carts = await CartModel.find({ user })
            .populate({
                path: 'course',
                populate: { path: "author", select: "_id fullName" },
                select: '_id name thumbnail author currentPrice category level'
            })
            .select("-_id")
            .lean()
        // tính toán tiền ước tính
        var totalDiscount = 0
        var totalPrice = 0
        for (let i = 0; i < carts.length; i++) {
            var cart = carts[i];
            var { course, coupon } = cart
            let code = await CouponModel.findOne({ code: coupon })
            if (!code) {
                cart.course.discount = 0
                continue
            }
            const result = helper.hanlderApplyDiscountCode(course, code)
            if (result.isApply == true) {
                cart.course.discount = result.discountAmount
            } else {
                cart.course.discount = 0
            }
            totalDiscount += result.discountAmount
            totalPrice += course.currentPrice
        }
        res.status(200).json({ message: "ok", totalPrice, totalDiscount, carts })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error" })
    }
}

// fn: cập nhật thông tin giỏ hàng (add coupon code)
const putCart = async (req, res, next) => {
    try {
        const { user } = req
        const { course } = req.params
        const { coupon } = req.body
        // lấy giỏ hàng
        const carts = await CartModel.find({ user }).lean()

        // kiểm tra giỏ
        const hadCart = await CartModel.findOne({ user, course }).lean()
        if (!hadCart) return res.status(400).json({ message: "giỏ hàng không tồn tại" })

        // kiểm tra mã giảm giá
        const cp = await CouponModel.findOne({ code: coupon }).lean()
        if (!cp) return res.status(400).json({ message: "mã giảm giá không tồn tại" })

        // kiểm tra mã có đang dùng không
        const isExisted = carts.some(cart => cart.coupon === coupon)
        if (isExisted) return res.status(400).json({ message: "mã giảm giá đã được áp dụng" })

        // lấy khoá học
        const c = await CourseModel.findById(course).lean()

        // kiểm tra mã giảm giá có áp dụng được cho khoá học này
        let result = helper.hanlderApplyDiscountCode(c, cp)
        let message = result.message
        if (result.isApply) {
            await CartModel.updateOne({ _id: hadCart._id }, { coupon })
        }
        res.status(200).json({ message })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error" })
    }
}


// fn: loại bỏ khoá học khỏi giỏ hàng
const deleteCart = async (req, res, next) => {
    try {
        const { user } = req
        const { course } = req.params
        await CartModel.deleteOne({ user, course })
        res.status(200).json({ message: "remove ok" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error" })
    }
}


module.exports = {
    postCart,
    getCart,
    putCart,
    deleteCart,
}