const CouponModel = require('../models/coupon.model');

// fn: lấy danh sách mã và phân trang
const getCoupons = async (req, res, next) => {
    try {
        const { page = 1, limit = 12, active, code } = req.query
        let aQuery = [
            {
                $lookup: {
                    from: 'users',
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $unwind: "$author"
            },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
        ]
        if (active) {
            if (active == 'true') {
                aQuery.unshift({
                    $match: {
                        expireDate: { $gt: new Date() }
                    }
                })
            } else {
                aQuery.unshift({
                    $match: {
                        expireDate: { $lt: new Date() }
                    }
                })
            }
        }
        if (code) {
            aQuery.unshift({
                $match: {
                    code: new RegExp(code, 'img')
                }
            })
        }
        const coupons = await CouponModel.aggregate(aQuery)
        aQuery.push({ $count: "total" })
        const totalCount = await CouponModel.aggregate(aQuery)
        const total = totalCount[0]?.total || 0

        return res.status(200).json({ message: 'ok', total, coupons })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}

// fn: lấy chi tiết mã
const getCoupon = async (req, res, next) => {
    try {
        const { code } = req.query
        const coupon = await CouponModel.findOne({ code }).lean()
        return res.status(200).json({ message: 'ok', coupon })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}

// fn: tạo mới mã
const postCoupon = async (req, res, next) => {
    try {
        const user = req.user
        const { code, title, type, apply, amount, startDate, expireDate, maxDiscount, minPrice, number } = req.body

        const coupon = await CouponModel.findOne({ code }).lean()
        if (coupon) return res.status(400).json({ message: "Invalid code" })
        await CouponModel.create({
            code, title, type, apply, amount, startDate, expireDate, maxDiscount, minPrice, number, author: user._id
        })
        return res.status(201).json({ message: "oke" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })

    }
}

// fn: cập nhật mã
const updateCoupon = async (req, res, next) => {
    try {
        const { code } = req.params
        const newCoupon = req.body
        await CouponModel.updateOne({ code }, newCoupon)
        return res.status(200).json({ message: "update ok" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}

// fn: xoá mã
const deleteCoupon = async (req, res, next) => {
    try {
        const { code } = req.params
        const { account, user } = req
        if (account.role === 'admin') {
            await CouponModel.deleteOne({ code })
        } else {
            await CouponModel.deleteOne({ code, author: user._id })
        }
        return res.status(200).json({ message: "delete ok" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}

// fn: xoá nhiều mã
const deleteManyCoupon = async (req, res, next) => {
    try {
        const { codes } = req.body
        const { account, user } = req
        if (account.role === 'admin') {
            await CouponModel.deleteMany({ code: { $in: codes } })
        } else {
            await CouponModel.deleteMany({ code: { $in: codes }, author: user._id })
        }
        return res.status(200).json({ message: "delete ok" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}


module.exports = {
    getCoupons,
    getCoupon,
    postCoupon,
    updateCoupon,
    deleteCoupon,
    deleteManyCoupon,
}