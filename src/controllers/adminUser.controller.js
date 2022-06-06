const AccountModel = require('../models/users/account.model')
const UserModel = require('../models/users/user.model');
const HistorySearchModel = require('../models/users/historySearch.model');
var bcrypt = require('bcryptjs')
var xlsx = require('node-xlsx').default
var fs = require('fs');
const MyCourseModel = require('../models/users/myCourse.model');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

function ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
        return (true)
    }
    return (false)
}


// fn: lấy thông tin và tài khoản người dùng
// GET /api/admin/users?page=1&limit=10&role=user
const getAccountAndUsers = async (req, res, next) => {
    try {
        const { page, limit, sort, email, role, active = 'true' } = req.query
        let aCountQuery = [
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'account',
                    foreignField: '_id',
                    as: 'account'
                }
            },
            { $match: { 'account.isActive': active == 'true' } }

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
            { $match: { 'account.isActive': active == 'true' } }
        ]
        if (email) {
            aQuery.push({ $match: { "account.email": new RegExp(email, 'img') } })
            aCountQuery.push({ $match: { "account.email": new RegExp(email, 'img') } })
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
        })

        if (page && limit) {
            aQuery.push(
                {
                    $skip: (parseInt(page) - 1) * parseInt(limit)
                },
                {
                    $limit: parseInt(limit)
                }
            )
        }

        aCountQuery.push({
            $count: 'total'
        })
        const totalUsers = await UserModel.aggregate(aCountQuery)
        let total = totalUsers[0]?.total || 0
        const users = await UserModel.aggregate(aQuery)
        res.status(200).json({ message: "ok", total, users })
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
            .populate('account', '-__v -password -refreshToken -accessToken')
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
        const { email, password, role = 'student', fullName, birthday, gender, phone } = req.body

        if (ValidateEmail(email)) {
            const newAcc = await AccountModel.create({ email: email.toLowerCase(), password, role })
            if (newAcc) {
                const newUser = await UserModel.create({ fullName, account: newAcc._id, birthday, gender: gender == 'true', phone })
                if (newUser) {
                    await HistorySearchModel.create({ user: newUser._id })
                }
            }
            return res.status(201).json({ message: "ok" })
        } else {
            return res.status(400).json({ message: "email không hợp lệ" })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "error" })
    }
}

// fn: tạo  nhiều tài khoản và người dùng
// POST /api/admin/users/multiple
const postMultiAccountAndUser = async (req, res, next) => {
    try {
        const file = req.file
        // đọc data
        var data = xlsx.parse(file.path)[0].data
        // xoá dòng trống
        data = data.filter(row => row.length != 0)
        let errorEmails = []
        let sucess = 0
        let logs = Date.now() + '.txt'
        // lặp tạo tài khoản
        for (let i = 1; i < data.length; i++) {
            var [email, password, role, fullName, gender] = data[i];
            if (email != null) {
                if (ValidateEmail(email)) {
                    if (password != null && password.toString().trim() > 7) {
                        try {
                            const newAcc = await AccountModel.create({ email, password: password.trim().toString(), role })
                            if (newAcc) {
                                const newUser = await UserModel.create({ fullName, account: newAcc._id, gender: gender == 'true' })
                                if (newUser) {
                                    await HistorySearchModel.create({ user: newUser._id })
                                    sucess++
                                }
                            }
                        } catch (error) {
                            fs.appendFileSync(`./src/public/logs/${logs}`, `dòng ${i + 1}, lỗi email ${email} đã được sử dụng \n`);
                        }
                    } else {
                        fs.appendFileSync(`./src/public/logs/${logs}`, `dòng ${i + 1}, lỗi password: "${password}" không hợp lệ hoặc bỏ trống \n`);
                    }
                } else {
                    fs.appendFileSync(`./src/public/logs/${logs}`, `dòng ${i + 1}, lỗi email ${email} không hợp lệ \n`);
                }
            } else {
                fs.appendFileSync(`./src/public/logs/${logs}`, `dòng ${i + 1}, lỗi email không được để trống \n`);
            }
        }
        if (sucess == data.length - 1) {
            res.status(201).json({ message: `đã tạo ${sucess}/${data.length - 1} tài khoản` })
        } else {
            res.status(201).json({ message: `đã tạo ${sucess}/${data.length - 1} tài khoản`, urlLogs: `/logs/${logs}` })
        }
        // xoá file
        fs.unlinkSync(file.path);

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
        let message = ""
        if (account !== null && typeof (account) === 'object') {
            let user = await UserModel.findById(id).lean()
            if (account.password) {
                if (account.password.trim().length > 7) {
                    const hashPassword = await bcrypt.hash(
                        account.password.trim(),
                        parseInt(process.env.SALT_ROUND),
                    );
                    account.password = hashPassword
                } else {
                    return res.status(400).json({ message: 'password phải dài hơn 7 ký tự' })
                }
            }
            await AccountModel.updateOne({ _id: user.account }, account)
        }
        if (user !== null && typeof (user) === 'object') {
            await UserModel.updateOne({ _id: id }, user)
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

// DELETE /api/admin/users
const deleteMultiAccountAndUser = async (req, res, next) => {
    try {
        const { ids } = req.body
        let logs = ''
        let sucess = 0
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i]
            let user = {}
            try {
                user = await UserModel.findById(id)
            } catch (error) {
                logs += `Lỗi: index:${i}. id "${id}" không hợp lệ \n`
            }
            if (!user) {
                logs += `Lỗi: index:${i}. id "${id}" không tồn tại \n`
                continue
            }
            const { modifiedCount } = await AccountModel.updateOne({ _id: user.account }, { isActive: false })
            if (modifiedCount != 1) {
                logs += `Lỗi: index:${i}. id "${id}" giá trị cập nhật không khác giá trị ban đầu`
                continue
            }
            sucess++
        }
        if (logs == '') {
            return res.status(200).json({ message: `update ${sucess}/${ids.length} oke` })
        } else {
            return res.status(200).json({ message: `update ${sucess}/${ids.length} oke`, error: logs })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "error" })
    }
}

// lấy danh sách id học sinh của 1 teacher
const getStudentsOfTeacher = async (req, res, next) => {
    try {
        const { id } = req.params
        var data = await MyCourseModel.aggregate([
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            {
                $match: { 'course.author': ObjectId(id) }
            },
            {
                $project: {
                    _id: 0,
                    user: 1
                }
            }
        ])
        data = data.map(item => item.user)
        res.status(200).json({ message: "ok", data })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "ok" })
    }
}


module.exports = {
    getAccountAndUsers,
    getDetailAccountAndUser,
    postAccountAndUser,
    postMultiAccountAndUser,
    putAccountAndUser,
    deleteAccountAndUser,
    deleteMultiAccountAndUser,
    getStudentsOfTeacher
}
