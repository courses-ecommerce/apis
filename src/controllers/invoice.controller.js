const DetailInvoiceModel = require("../models/detailInvoice.model");
const InvoiceModel = require("../models/invoice.model")
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;


// fn: get all invoice
const getInvoices = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort, status, transaction, user } = req.query
        let query = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: "user"
                }
            },
            { $limit: parseInt(limit) },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
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
        const totalInvoice = totalCount[0] || 0
        res.status(200).json({ message: 'ok', totalInvoice, invoices, page, limit })
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
            { $match: { _id: ObjectId(id) } },
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