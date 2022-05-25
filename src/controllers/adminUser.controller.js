const AccountModel = require('../models/users/account.model')
const UserModel = require('../models/users/user.model');
const HistorySearchModel = require('../models/users/historySearch.model');
var bcrypt = require('bcryptjs')

// fn: lấy thông tin và tài khoản người dùng
// GET /api/admin/users?page=1&limit=10&role=user
const getAccountAndUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort, email, role } = req.query
        var nSkip = (parseInt(page) - 1) * parseInt(limit)
        let aCountQuery = [
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'account',
                    foreignField: '_id',
                    as: 'account'
                }
            }
        ]
        let aQuery = [
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'account',
                    foreignField: '_id',
                    as: 'account'
                }
            },
            {
                $unwind: "$account"
            },
        ]
        if (email) {
            aQuery.push({ $match: { "account.email": email } })
            aCountQuery.push({ $match: { "account.email": email } })
        }
        if (role) {
            aQuery.push({ $match: { "account.role": role } })
            aCountQuery.push({ $match: { "account.role": role } })
        }
        if (sort) {
            let sortBy = {}
            let [f, v] = sort.split('-')
            sortBy[f] = v == "asc" || v == 1 ? 1 : -1
            aQuery.push({ $sort: sortBy })
        }

        // phân trang và bỏ 1 số trường không cần dùng
        aQuery.push({
            $project: {
                'account.password': 0,
                'account.refreshToken': 0,
                'account.accessToken': 0,
                'account.__v': 0,
                '__v': 0,

            }
        }, {
            $skip: nSkip
        }, {
            $limit: parseInt(limit)
        })

        aCountQuery.push({
            $count: 'total'
        })
        const totalUsers = await UserModel.aggregate(aCountQuery)
        let total = totalUsers[0]?.total || 0
        const users = await UserModel.aggregate(aQuery)
        return res.status(200).json({ message: "ok", total, users })
    } catch (error) {
        console.error('> error :: ', error);
        return res.status(500).json({ message: 'error' })
    }
}

// fn: lấy thông tin chi tiết tài khoản người dùng
const getDetailAccountAndUser = async (req, res, next) => {
    try {
        const { id } = req.params
        const user = await UserModel.findById(id)
            .populate('account', '-__v -password -refreshToken')
            .lean()
        return res.status(200).json({ message: 'ok', user })
    } catch (error) {
        console.error('> error :: ', error);
        return res.status(500).json({ message: 'error' })
    }
}

// fn: tạo tài khoản và người dùng
// POST /api/admin/users
const postAccountAndUser = async (req, res, next) => {
    try {
        const { email, password, fullName, birthday, gender, phone } = req.body
        const newAcc = await AccountModel.create({ email, password })
        if (newAcc) {
            const newUser = await UserModel.create({ fullName, account: newAcc._id, birthday, gender, phone })
            if (newUser) {
                await HistorySearchModel.create({ user: newUser._id })
            }
        }
        return res.status(201).json({ message: "ok" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "error" })
    }
}

// fn: cập nhật tài khoản và người dùng
// PUT /api/admin/users/:id
const putAccountAndUser = async (req, res, next) => {
    try {
        const { id } = req.params
        var { user, account } = req.body
        // check input tránh hacker
        if (user && user.account) {
            delete user.account
        }
        if (account && account.email) {
            delete account.email
        }
        if (user !== null && typeof (user) === 'object') {
            await UserModel.updateOne({ _id: id }, user)
        }
        if (account !== null && typeof (account) === 'object') {
            let user = await UserModel.findById(id).lean()
            const hashPassword = await bcrypt.hash(
                account.password,
                parseInt(process.env.SALT_ROUND),
            );
            account.password = hashPassword
            if (account.isActive) {
                account.isActive = JSON.stringify(account.isActive) == 'true'
            }
            await AccountModel.updateOne({ _id: user.account }, account)
        }
        return res.status(200).json({ message: 'update ok' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "error" })
    }
}

// fn: xoá tài khoản và người dùng (chưa xoá my course, notification...)
// DELETE /api/admin/users/:id
const deleteAccountAndUser = async (req, res, next) => {
    try {
        const { id } = req.params

        let user = await UserModel.findById(id).lean()
        // await UserModel.deleteOne({ _id: id })
        // await AccountModel.deleteOne({ _id: user.account })
        await AccountModel.updateOne({ _id: user.account }, { isActive: false })
        return res.status(200).json({ message: 'ok! isActive : false' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "error" })
    }
}

module.exports = {
    getAccountAndUsers,
    getDetailAccountAndUser,
    postAccountAndUser,
    putAccountAndUser,
    deleteAccountAndUser,
}
