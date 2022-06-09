const CouponModel = require("../models/coupon.model");
const CourseModel = require("../models/courses/course.model");
const InvoiceModel = require("../models/invoice.model");
const UserModel = require("../models/users/user.model");
var xlsx = require('node-xlsx').default
var fs = require('fs');
const AccountModel = require("../models/users/account.model");
const DetailInvoiceModel = require("../models/detailInvoice.model");
const _ = require('lodash')

// fn: thống kê doanh thu từ ngày a đến b
const getDailyRevenue = async (req, res) => {
    try {
        // type = 'day', 'month'
        let { start, end, type = 'day', exports = 'false' } = req.query

        let startDate = new Date(start)
        let endDate = new Date(end)
        const invoices = await InvoiceModel.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
            status: 'Paid'
        }).select('_id paymentPrice createdAt').lean()

        var result = null
        if (type.toLowerCase().trim() == 'day') {
            let differenceInTime = endDate.getTime() - startDate.getTime();
            let differenceInDays = differenceInTime / (1000 * 3600 * 24);
            console.log('differenceInDays', differenceInDays);
            result = {}
            for (let i = 0; i < differenceInDays + 1; i++) {
                let startDateString = startDate.toISOString().split("T")[0]
                result[startDateString] = 0
                startDate.setDate(startDate.getDate() + 1)
            }
            // tính doanh thu mỗi ngày
            invoices.forEach(invoice => {
                let dateString = new Date(invoice.createdAt).toISOString().split("T")[0]
                result[dateString] += invoice.paymentPrice
            })
        } else if (type.toLowerCase().trim() == 'month') {
            startMonth = startDate.getMonth()
            startYear = startDate.getFullYear()
            endMonth = endDate.getMonth()
            endYear = endDate.getFullYear()

            let numOfMonth = (endYear - startYear - 1) * 12 + 12 - startMonth + 1 + endMonth
            result = {}
            for (let i = 0; i < numOfMonth; i++) {
                let dateString = startDate.toISOString().slice(0, 7)
                result[dateString] = 0
                startDate.setMonth(startDate.getMonth() + 1)
            }
            // tính doanh thu mỗi tháng
            invoices.forEach(invoice => {
                let dateString = new Date(invoice.createdAt).toISOString().slice(0, 7)
                result[dateString] += invoice.paymentPrice
            })
        }
        if (exports.toLowerCase().trim() == 'true') {
            const data = [
                [`BẢNG THỐNG KÊ DOANH THU THEO ${type == 'day' ? 'NGÀY' : "THÁNG"} TỪ ${start} ĐẾN ${end}`],
                [`${type == 'day' ? 'NGÀY' : "THÁNG"}`],
                [`Doanh thu (vnđ)`],
            ];
            for (const key in result) {
                data[1].push(key)
                data[2].push(result[key])
            }
            const range = { s: { c: 0, r: 0 }, e: { c: 10, r: 0 } }; // A1:A4
            const sheetOptions = { '!merges': [range] };
            var buffer = xlsx.build([{ name: 'Thống kê doanh thu', data: data }], { sheetOptions }); // Returns a buffer
            fs.createWriteStream('./src/public/statistics/thong-ke-doanh-so-theo-ngay.xlsx').write(buffer);
            return res.status(200).json({ message: "ok", result, file: '/statistics/thong-ke-doanh-so-theo-ngay.xlsx' })
        }
        res.status(200).json({ message: "ok", result })
    } catch (error) {
        console.log(error);
        res.status(200).json({ message: error.message })
    }
}

// fn: thống kê doanh thu theo tháng trong năm x và so sánh vs năm x -1
const getMonthlyRevenue = async (req, res, next) => {
    try {
        var { year } = req.params
        var { exports = 'false', number = 0 } = req.query
        number = parseInt(number)
        year = parseInt(year)

        // lấy danh sách hoá đơn đã thanh toán trong năm year và năm year - 1
        const invoices = await InvoiceModel.find({
            createdAt: {
                $gte: new Date(`${year - number}-01-01`),
                $lte: new Date(`${year}-12-31`),
            },
            status: 'Paid'
        }).select('_id paymentPrice createdAt').lean()
        console.log(invoices);

        // doanh thu mỗi tháng
        var result = Array(number + 1).fill(Array(12).fill(0))
        result = JSON.stringify(result)
        result = JSON.parse(result)
        // tính toán doanh thu mỗi tháng
        invoices.forEach(item => {
            const m = new Date(item.createdAt).getMonth()
            const y = new Date(item.createdAt).getFullYear()
            result[y - year + number][m] += item.paymentPrice
        })



        if (exports.toLowerCase().trim() == 'true') {
            const data = [
                [`BẢNG THỐNG KÊ DOANH THU NĂM ${year - number} - ${year}`],
                [null, 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
            ];
            for (let i = 0; i < result.length; i++) {
                data.push([`Năm ${year - number + i}`, ...result[i]])
            }

            const range = { s: { c: 0, r: 0 }, e: { c: 12, r: 0 } }; // A1:A4
            const sheetOptions = { '!merges': [range] };
            var buffer = xlsx.build([{ name: 'Thống kê doanh thu', data: data }], { sheetOptions }); // Returns a buffer
            fs.createWriteStream('./src/public/statistics/thong-ke-doanh-so-theo-thang.xlsx').write(buffer);
            return res.status(200).json({ message: "ok", result, file: '/statistics/thong-ke-doanh-so-theo-thang.xlsx' })
        }

        res.status(200).json({ message: "ok", result })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

// fn: doanh thu theo năm
const getYearlyRevenue = async (req, res) => {
    try {
        const { start, end, exports = 'false' } = req.query

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
        let raise = (result[parseInt(end) - parseInt(start)] * 100 / result[0]) - 100

        if (exports.toLowerCase().trim() == 'true') {
            const data = [
                [`BẢNG THỐNG KÊ DOANH THU TỪ NĂM ${start} - ${end}`],
                ["Năm"],
                [`Doanh thu`, ...result, `Doanh thu ${end} ${raise >= 0 ? "tăng" : "giảm"} ${Math.abs(raise)}% so với năm ${start}`],
            ];
            for (let i = parseInt(start); i < parseInt(end) + 1; i++) {
                data[1].push(i)
            }
            const range = { s: { c: 0, r: 0 }, e: { c: 12, r: 0 } }; // A1:A4
            const sheetOptions = { '!merges': [range] };
            var buffer = xlsx.build([{ name: 'Thống kê doanh thu', data: data }], { sheetOptions }); // Returns a buffer
            fs.createWriteStream('./src/public/statistics/thong-ke-doanh-so-theo-nam.xlsx').write(buffer);
            return res.status(200).json({ message: "ok", result, file: '/statistics/thong-ke-doanh-so-theo-nam.xlsx' })
        }
        res.status(200).json({ message: "ok", result })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

// fn: thống kê user mới theo năm
const getCountUsersByYear = async (req, res, next) => {
    try {
        var { start, end, exports = 'false' } = req.query
        start = parseInt(start)
        end = parseInt(end)

        let newUsers = [...Array(end - start + 1).fill(0)]

        for (let i = 0; i <= end - start; i++) {
            let year = start + i
            const news = await AccountModel.find({
                createdAt: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            }).count()
            newUsers[i] = news
        }
        let raise = (newUsers[end - start] * 100 / newUsers[0]) - 100 || 0

        const activating = await AccountModel.find({ isActive: true }).count()
        const notActivating = await AccountModel.find({ isActive: false }).count()

        if (exports.toLowerCase() == 'true') {
            const data = [
                [`BẢNG THỐNG KÊ NGƯỜI DÙNG TỪ NĂM ${start} ĐẾN ${end}`],
                ['Năm'],
                ['Người dùng mới', ...newUsers, `${raise.toFixed(1)}% so với năm ${start}`],
                [],
                [null, 'Số lượng'],
                ['Tổng người dùng đang hoạt động', activating],
                ['Tổng người đang bị khoá', notActivating],
                ['Tổng người dùng', activating + notActivating],
            ];
            for (let i = 0; i <= end - start; i++) {
                data[1].push(start + i)
            }
            const range = { s: { c: 0, r: 0 }, e: { c: end - start + 1, r: 0 } }; // A1:A4
            const sheetOptions = { '!merges': [range] };
            var buffer = xlsx.build([{ name: 'Thống kê người dùng', data: data }], { sheetOptions }); // Returns a buffer
            fs.createWriteStream('./src/public/statistics/thong-ke-user.xlsx').write(buffer);
            res.status(200).json({ message: "ok", raise, newUsers, activating, notActivating, file: '/statistics/thong-ke-user.xlsx' })
            return
        }
        res.status(200).json({ message: "ok", raise, newUsers, activating, notActivating })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

// fn: thống kê user mới theo các tháng
const getCountUsersByMonth = async (req, res, next) => {
    try {
        var { year, exports = 'false' } = req.query
        year = parseInt(year)

        let thisYear = [...Array(12).fill(0)]
        let lastYear = [...Array(12).fill(0)]

        const activating = await AccountModel.find({ isActive: true }).count()
        const notActivating = await AccountModel.find({ isActive: false }).count()

        for (let i = 0; i <= 11; i++) {
            let users = await UserModel.aggregate([
                {
                    $project: {
                        createdAt: 1,
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" },
                    }
                },
                {
                    $match: {
                        month: i + 1,
                        year: year
                    }
                },
                {
                    $count: 'total'
                }
            ])
            thisYear[i] = users[0]?.total || 0

            users = await UserModel.aggregate([
                {
                    $project: {
                        createdAt: 1,
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" },
                    }
                },
                {
                    $match: {
                        month: i + 1,
                        year: year - 1
                    }
                },
                {
                    $count: 'total'
                }
            ])
            lastYear[i] = users[0]?.total || 0
        }

        if (exports.toLowerCase().trim() == 'true') {
            const data = [
                [`BẢNG THỐNG KÊ NGƯỜI DÙNG MỚI THEO THÁNG TRONG NĂM ${year} và ${year - 1}`],
                ['Năm'],
                [`${year - 1}`, ...lastYear],
                [`${year}`, ...thisYear],
                [],
                [null, 'Số lượng'],
                ['Tổng người dùng đang hoạt động', activating],
                ['Tổng người đang bị khoá', notActivating],
                ['Tổng người dùng', activating + notActivating],
            ];
            for (let i = 1; i <= 12; i++) {
                data[1].push(`Tháng ${i}`)
            }
            const range = { s: { c: 0, r: 0 }, e: { c: 13, r: 0 } }; // A1:A4
            const sheetOptions = { '!merges': [range] };
            var buffer = xlsx.build([{ name: 'Thống kê người dùng', data: data }], { sheetOptions }); // Returns a buffer
            fs.createWriteStream('./src/public/statistics/thong-ke-user.xlsx').write(buffer);
            res.status(200).json({ message: "ok", thisYear, lastYear, file: '/statistics/thong-ke-user.xlsx' })
            return
        }

        res.status(200).json({ message: "ok", thisYear, lastYear })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

// fn: thống kê số lượng khoá học
const getCountCourses = async (req, res, next) => {
    try {
        // khoá học đang publish
        const publishCourse = await CourseModel.find({ publish: true }).count()
        // khoá học đang chờ duyệt
        const pendingCourse = await CourseModel.find({ status: 'pending' }).count()
        res.status(200).json({ message: 'ok', publishCourse, pendingCourse })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

// fn: thống kê số lượng bán của khoá học
const getTopSaleCourses = async (req, res, next) => {
    try {
        const { top = 5, year, exports = 'false' } = req.query
        let query = [
            {
                $project: {
                    courseId: 1,
                    courseName: 1,
                    createdAt: 1,
                    couponCode: 1,
                    courseSlug: 1,
                    discount: 1,
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                }
            },
            {
                $match: {
                    year: parseInt(year)
                }
            },
            {
                $group: {
                    _id: { courseId: "$courseId", month: "$month" },
                    courseName: { $first: "$courseName" },
                    courseSlug: { $first: "$courseSlug" },
                    couponCode: { $push: "$couponCode" },
                    count: { $count: {} },
                }
            },
            {
                $project: {
                    courseId: 1,
                    courseName: 1,
                    couponCode: 1,
                    courseSlug: 1,
                    count: 1,
                    month: 1,
                }
            },
            { $sort: { '_id.month': 1, count: -1, } },
        ]
        // group theo id va month
        const detailInvoices = await DetailInvoiceModel.aggregate(query)

        // group theo month
        let data = _(detailInvoices)
            .groupBy(x => x._id.month)
            .map((value, key) => ({ month: key, courses: value }))
            .value();

        // làm sạch data
        data.map(item => {
            item.month = parseInt(item.month)
            item.courses.map(i => {
                let haveCode = i.couponCode.filter(course => course.couponCode != '').length
                i.haveCode = haveCode
                delete i.couponCode
                i._id = i._id.courseId
                return i
            })
            return item
        })

        // khởi tạo khuôn data
        let result = Array(12).fill(Array(parseInt(top)).fill(null))
        result = JSON.parse(JSON.stringify(result))

        // điền data vào khuôn
        for (let i = 0; i < 12; i++) {
            if (data[i]?.month) {
                result[data[i].month - 1] = data[i].courses
            } else {
                continue
            }
        }

        if (exports.toLowerCase().trim() == 'true') {
            const data = [
                [`BẢNG THỐNG KÊ TOP ${top} KHOÁ HỌC CÓ SỐ LƯỢNG BÁN TRONG NĂM ${year}`],
                ['Tháng',], ['Tháng 1',], ['Tháng 2',], ['Tháng 3',], ['Tháng 4',], ['Tháng 5',], ['Tháng 6',], ['Tháng 7',], ['Tháng 8',], ['Tháng 9',], ['Tháng 10',], ['Tháng 11',], ['Tháng 12'],
            ];
            for (let i = 1; i <= top; i++) {
                data[1].push(`Top ${i}`)
            }
            for (let i = 2; i <= 13; i++) {
                let courses = result[i - 2].map(i => {
                    let string = null
                    if (i) {
                        // string = '=HYPERLINK("https://hnam.works/' + i.courseSlug + '","' + i?.courseName + '. Số lượng:' + i.count + '")'
                        string = i.courseName + '. Số lượng:' + i.count
                    } else {
                        string = null
                    }
                    return string
                })
                data[i] = [...data[i], ...courses]
            }
            const range = { s: { c: 0, r: 0 }, e: { c: 12, r: 0 } }; // A1:A4
            const sheetOptions = { '!merges': [range] };
            var buffer = xlsx.build([{ name: 'Thống kê khoá học', data: data }], { sheetOptions }); // Returns a buffer
            fs.createWriteStream('./src/public/statistics/thong-ke-top-khoa-hoc.xlsx').write(buffer);
            return res.status(200).json({ message: "ok", result, file: '/statistics/thong-ke-top-khoa-hoc.xlsx' })

        }
        res.status(200).json({ message: "ok", result })
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
                query.startDate = { $lte: new Date() }
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
    getDailyRevenue,
    getMonthlyRevenue,
    getYearlyRevenue,
    getCountUsersByYear,
    getCountUsersByMonth,
    getCountCourses,
    getCountCoupons,
    getTopSaleCourses,
}