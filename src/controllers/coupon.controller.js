const CouponModel = require('../models/coupon.model');
const helper = require('../helper');
const CodeModel = require('../models/code.model');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
var fs = require('fs');


// fn: lấy danh sách mã và phân trang
const getCoupons = async (req, res, next) => {
    try {
        const { page, limit, active, title } = req.query
        const { account, user } = req

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
            {
                $lookup: {
                    from: 'codes',
                    localField: "_id",
                    foreignField: "coupon",
                    as: "codes"
                }
            },
            {
                $project: {
                    _id: 1,
                    'title': 1,
                    'type': 1,
                    'apply': 1,
                    'amount': 1,
                    'startDate': 1,
                    'expireDate': 1,
                    'maxDiscount': 1,
                    'minPrice': 1,
                    'number': 1,
                    'remain': { $size: { $filter: { 'input': "$codes", "cond": { $eq: ["$$this.isActive", true] } } } },
                    'author._id': 1,
                    'author.fullName': 1,
                }
            }
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
        if (title) {
            aQuery.unshift({
                $match: {
                    title: new RegExp(title, 'img')
                }
            })
        }
        if (page && limit) {
            aQuery.push(
                { $skip: (parseInt(page) - 1) * parseInt(limit) },
                { $limit: parseInt(limit) },
            )
        }

        if (account.role == 'teacher') {
            aQuery.push({ $match: { author: user._id } })
        }
        const coupons = await CouponModel.aggregate(aQuery)

        let data = coupons.map(item => {
            let now = new Date()
            let expireDate = new Date(item.expireDate)
            if (expireDate > now) {
                item.isActive = true
            } else {
                item.isActive = false
            }
            return item
        })
        aQuery.push({ $count: "total" })
        const totalCount = await CouponModel.aggregate(aQuery)
        const total = totalCount[0]?.total || 0

        return res.status(200).json({ message: 'ok', total, coupons: data })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}

// fn: lấy chi tiết mã
const getCoupon = async (req, res, next) => {
    try {
        const { id } = req.params
        const data = await CouponModel.aggregate([
            { $match: { _id: ObjectId(id) } },
            {
                $lookup: {
                    from: "codes",
                    localField: "_id",
                    foreignField: "coupon",
                    as: 'codes'
                }
            },
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
            {
                $project: {
                    _id: 1,
                    'title': 1,
                    'type': 1,
                    'apply': 1,
                    'amount': 1,
                    'startDate': 1,
                    'expireDate': 1,
                    'maxDiscount': 1,
                    'minPrice': 1,
                    'number': 1,
                    'remain': { $size: { $filter: { 'input': "$codes", "cond": { $eq: ["$$this.isActive", true] } } } },
                    'author._id': 1,
                    'author.fullName': 1,
                    'codes.code': 1,
                    'codes.isActive': 1,
                }
            }
        ])
        if (data.length == 0) {
            return res.status(400).json({ message: 'coupon không tồn tại' })
        }
        return res.status(200).json({ message: 'ok', coupon: data[0] })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}

// fn: tạo mới mã
const postCoupon = async (req, res, next) => {
    try {
        const user = req.user
        const { title, type, apply, amount, startDate, expireDate, maxDiscount, minPrice, number } = req.body
        req.body.author = user._id

        let data = Object.fromEntries(Object.entries(req.body).filter(([_, v]) => v != null));

        if (type == 'percent') {
            if (amount > 100 || amount <= 0) {
                return res.status(400).json({ message: "amount phải > 0 và <= 100" })
            }
        } else if (type == 'money') {
            if (amount <= 0) {
                return res.status(400).json({ message: "amount phải là số dương" })
            }
        }

        if (startDate && new Date(startDate) < new Date()) {
            return res.status(400).json({ message: "startDate không hợp lệ" })
        }

        if (expireDate && new Date(expireDate) < new Date()) {
            return res.status(400).json({ message: "expireDate không hợp lệ" })
        }

        if (maxDiscount && maxDiscount <= 0) {
            return res.status(400).json({ message: "maxDiscount phải là số dương" })
        }

        if (minPrice && minPrice < 0) {
            return res.status(400).json({ message: "minPrice phải là số dương" })
        }

        if (number && number <= 0) {
            return res.status(400).json({ message: "number phải là số dương" })
        }

        const coupon = await CouponModel.create(data)
        res.status(201).json({ message: "oke" })
        const codes = helper.generateDiscountCode(10, parseInt(number) || 100)
        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            await CodeModel.create({
                coupon, code
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })

    }
}

// fn: cập nhật mã
const updateCoupon = async (req, res, next) => {
    try {
        const { id } = req.params
        const { user } = req
        const newCoupon = req.body
        await CouponModel.updateOne({ _id: id, author: user._id }, newCoupon)
        return res.status(200).json({ message: "update ok" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}

// fn: xoá mã
const deleteCoupon = async (req, res, next) => {
    try {
        const { id } = req.params
        const { account, user } = req
        if (account.role === 'admin') {
            await CouponModel.deleteOne({ _id: id })
        } else {
            await CouponModel.deleteOne({ _id: id, author: user._id })
        }
        await CodeModel.deleteMany({ coupon: id })
        return res.status(200).json({ message: "delete ok" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}

// fn: xoá nhiều mã
const deleteManyCoupon = async (req, res, next) => {
    try {
        var { ids } = req.body
        const { account, user } = req
        ids = ids.map(id => ObjectId(id))
        let logs = ''
        let success = 0
        var coupons = null
        if (account.role === 'admin') {
            coupons = await CouponModel.aggregate([
                { $match: { _id: { $in: ids } } },
                {
                    $lookup: {
                        from: 'codes',
                        localField: "_id",
                        foreignField: "coupon",
                        as: "codes"
                    }
                },
                {
                    $project: {
                        'title': 1,
                        'number': 1,
                        'remain': { $size: { $filter: { 'input': "$codes", "cond": { $eq: ["$$this.isActive", true] } } } },
                    }
                }
            ])
        } else {
            coupons = await CouponModel.aggregate([
                { $match: { _id: { $in: ids } } },
                { $match: { author: user._id } },
                {
                    $lookup: {
                        from: 'codes',
                        localField: "_id",
                        foreignField: "coupon",
                        as: "codes"
                    }
                },
                {
                    $project: {
                        'title': 1,
                        'number': 1,
                        'remain': { $size: { $filter: { 'input': "$codes", "cond": { $eq: ["$$this.isActive", true] } } } },
                    }
                }
            ])
        }

        for (let i = 0; i < coupons.length; i++) {
            const coupon = coupons[i];
            if (coupon.number == coupon.remain) {
                await CouponModel.deleteOne({ _id: coupon._id })
                await CodeModel.deleteMany({ coupon: coupon._id })
                success++
            } else {
                logs += `id:${coupon._id}, title: ${coupon.title} mã đã có người dùng.\n`
            }
        }

        if (logs != '') {
            let file = Date.now()
            fs.appendFileSync(`./src/public/logs/${file}.txt`, logs);
            return res.status(200).json({ message: `delete ${success}/${coupons.length}`, urlLogs: `/logs/${file}.txt` })
        }

        return res.status(200).json({ message: `delete ${success}/${coupons.length}` })

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