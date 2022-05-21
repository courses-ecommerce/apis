const UserModel = require('../models/users/user.model');
const AccountModel = require('../models/users/account.model');
const TeacherModel = require('../models/users/teacher.model')
const HistorySearchModel = require('../models/users/historySearch.model');
const HistoryViewModel = require('../models/users/historyView.model');
const InvoiceModel = require('../models/invoice.model');

// fn: lấy thông tin user hiện tại
const getUser = async (req, res, next) => {
    try {
        const { _id } = req.user
        const user = await UserModel.findById(_id).populate('account', 'email role')
        res.status(200).json({ message: "ok", user })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error" })
    }
}

// fn: cập nhật thông tin user
const putUser = async (req, res, next) => {
    try {
        const newUser = req.body
        const { _id } = req.user
        const user = await UserModel.findOneAndUpdate({ _id }, newUser, { new: true })
        res.status(200).json({ message: "update oke", user })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error" })
    }
}

// fn: kích hoạt instructor
const postActiveTeacherRole = async (req, res, next) => {
    try {
        const { user } = req
        // kiểm tra đã kích hoạt chưa
        var teacher = await TeacherModel.findOne({ user }).lean()
        let message = "kích hoạt thành công"
        if (teacher) {
            message = "Đã kích hoạt role teacher"
        }
        else {
            teacher = await TeacherModel.create({ user })
        }
        res.status(200).json({ message, teacher })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error" })
    }
}

// fn: lấy lịch sử tìm kiếm
const getHistorySearchAndView = async (req, res, next) => {
    try {
        const { user } = req
        // lấy lich sử tìm
        const historySearch = await HistorySearchModel.findOne({ user }).select('historySearchs -_id').lean()
        // lấy lich sử xem
        const historyView = await HistoryViewModel.findOne({ user }).select('historyViews -_id')
            .populate({ path: 'historyViews', model: 'course', select: '_id name slug thumbnail' })
            .lean()

        res.status(200).json({ message: "ok", historySearch, historyView })
    } catch (error) {
        console.log(error);
        res.status(200).json({ message: "error" })
    }
}

// fn: lấy lịch sử thanh toán
const getMyInvoices = async (req, res, next) => {
    try {
        const { page = 1, limit = 12, status } = req.query
        const { user } = req
        let query = [
            {
                $match: {
                    user: user._id
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: "user"
                }
            },
            {
                $lookup: {
                    from: 'detailInvoices',
                    localField: '_id',
                    foreignField: 'invoice',
                    as: "detailInvoices"
                }
            },
            { $limit: parseInt(limit) },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
        ]

        if (status) {
            query.push({ $match: { status: status } })
        }

        const invoices = await InvoiceModel.aggregate(query)
        query.push({ $count: "total" })
        const totalCount = await InvoiceModel.aggregate(query)
        const total = totalCount[0]?.total || 0

        res.status(200).json({ message: 'ok', total, invoices })

    } catch (error) {
        console.log(error);
        res.status(200).json({ message: "error" })
    }
}


module.exports = {
    getUser,
    putUser,
    postActiveTeacherRole,
    getHistorySearchAndView,
    getMyInvoices,
}