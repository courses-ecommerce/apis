const DetailInvoiceModel = require("../models/detailInvoice.model");
const InvoiceModel = require("../models/invoice.model")
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;


// fn: get all invoice và phân trang
const getInvoices = async (req, res, next) => {
    try {
        const { page, limit, sort, status, transaction, user } = req.query
        let query = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    'transactionId': 1,
                    'totalPrice': 1,
                    'totalDiscount': 1,
                    'paymentPrice': 1,
                    'status': 1,
                    // 'user': 1
                    'user': { "_id": 1, "fullName": 1, 'phone': 1, 'avatar': 1 },
                    'createdAt': {
                        $dateToString: {
                            date: "$createdAt",
                            format: '%Y-%m-%dT%H:%M:%S',
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    },
                }
            },

        ]
        if (status) {
            query.unshift({ $match: { status: status } })
        }
        if (transaction) {
            query.unshift({ $match: { transactionId: transaction } })
        }
        if (user) {
            query.unshift({ $match: { user: user } })
        }
        if (limit && page) {
            query.push(
                { $limit: parseInt(limit) },
                { $skip: (parseInt(page) - 1) * parseInt(limit) },
            )
        }
        // sắp xếp và thống kê
        if (sort) {
            let [f, v] = sort.split('-')
            let sortBy = {}
            sortBy[f] = v == "asc" || v == 1 ? 1 : -1
            query.push({ $sort: sortBy })
        }

        const invoices = await InvoiceModel.aggregate(query)
        query.push({ $count: "total" })
        const totalCount = await InvoiceModel.aggregate(query)
        const total = totalCount[0]?.total || 0
        res.status(200).json({ message: 'ok', total, invoices, page, limit })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "error" })
    }
}


//fn : get detail invoice
const getDetailInvoice = async (req, res, next) => {
    try {
        const { id } = req.params
        const invoice = await InvoiceModel.aggregate([
            { $match: { _id: id } },
            {
                $lookup: {
                    from: "users",
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: "detailInvoices",
                    localField: '_id',
                    foreignField: 'invoice',
                    as: 'detailInvoices'
                }
            },
            {
                $project: {
                    'transactionId': 1,
                    'totalPrice': 1,
                    'totalDiscount': 1,
                    'paymentPrice': 1,
                    'status': 1,
                    'user': { "_id": 1, "fullName": 1, 'phone': 1, 'avatar': 1 },
                    'createdAt': {
                        $dateToString: {
                            date: "$createdAt",
                            format: '%Y-%m-%dT%H:%M:%S',
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    },
                    'detailInvoices': 1
                }
            }
        ])
        res.status(200).json({ message: 'ok', invoice })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "error" })
    }
}

//fn: cập nhật hoá đơn
const putInvoice = async (req, res, next) => {
    try {
        const { id } = req.params
        const { status } = req.body

        await InvoiceModel.updateOne({ _id: id }, { status })
        res.status(200).json({ message: 'update ok' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "error" })
    }
}


module.exports = {
    getInvoices,
    getDetailInvoice,
    putInvoice
}