const { query } = require("express");
const CouponModel = require("../models/coupon.model");
const CourseModel = require("../models/courses/course.model");
const InvoiceModel = require("../models/invoice.model");
const UserModel = require("../models/users/user.model");



// fn: thống kê doanh thu theo tháng trong năm x và so sánh vs năm x -1
const getMonthlyRevenue = async (req, res, next) => {
    try {
        const { year } = req.params

        // lấy danh sách hoá đơn đã thanh toán trong năm year và năm year - 1
        const thisYearInvoices = await InvoiceModel.find({
            createdAt: {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`),
            },
            status: 'Paid'
        }).select('_id paymentPrice createdAt').lean()

        const lastYearInvoices = await InvoiceModel.find({
            createdAt: {
                $gte: new Date(`${parseInt(year) - 1}-01-01`),
                $lte: new Date(`${parseInt(year) - 1}-12-31`),
            },
            status: 'Paid'
        }).select('_id paymentPrice createdAt').lean()

        // doanh thu mỗi tháng
        var thisYear = [...Array(12).fill(0)]
        var lastYear = [...Array(12).fill(0)]

        // tính toán doanh thu mỗi tháng
        if (thisYearInvoices) {
            thisYearInvoices.forEach(item => {
                const month = new Date(item.createdAt).getMonth()
                thisYear[month] += item.paymentPrice
            })
        }
        if (lastYearInvoices) {
            lastYearInvoices.forEach(item => {
                const month = new Date(item.createdAt).getMonth()
                lastYear[month] += item.paymentPrice
            })
        }

        res.status(200).json({ message: "ok", thisYear, lastYear })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

// fn: doanh thu theo năm
const getYearlyRevenue = async (req, res) => {
    try {
        const { start, end } = req.query

        const invoices = await InvoiceModel.find({
            createdAt: {
                $gte: new Date(`${start}-01-01`),
                $lte: new Date(`${end}-12-31`),
            },
            status: 'Paid'
        }).select('_id paymentPrice createdAt').lean()

        var result = [...Array(parseInt(end) - parseInt(start) + 1).fill(0)]


        invoices.forEach(item => {
            const index = new Date(item.createdAt).getFullYear() - parseInt(start)
            result[index] += item.paymentPrice
        })

        res.status(200).json({ message: "ok", result })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

// fn: tổng số user đang hoạt động
const getCountUsers = async (req, res, next) => {
    try {
        const { isActive } = req.query
        let query = {}
        if (isActive) {
            query.isActive = isActive == ' true'
        }
        const total = await UserModel.find(query).count()
        res.status(200).json({ message: "ok", total })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

// fn: lấy số lượng khoá học theo query
const getCountCourses = async (req, res, next) => {
    try {

        const { status = 'pending', publish } = req.query
        let query = [{ $count: 'total' }]
        if (status) {
            query.unshift({ $match: { status } })
        }
        if (publish) {
            query.unshift({ $match: { publish: publish == 'true' } })
        }
        const count = await CourseModel.aggregate(query)
        let total = count[0]?.total || 0

        res.status(200).json({ message: 'ok', total })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

// fn: thống kê mã giảm giá
const getCountCoupons = async (req, res, next) => {
    try {
        const { active = 'true', countdown } = req.query

        let query = {}

        if (active) {
            if (active == 'true') {
                query.expireDate = { $gte: new Date() }
            } else {
                query.expireDate = { $lte: new Date() }
            }
        }

        if (countdown) {
            if (countdown == 'true') {
                query.startDate = { $gte: new Date() }
            } else {
                query.startDate = { $lte: new Date() }
            }
        }

        const total = await CouponModel.find(query).count()
        res.status(200).json({ message: 'ok', total })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    getMonthlyRevenue,
    getYearlyRevenue,
    getCountUsers,
    getCountCourses,
    getCountCoupons
}