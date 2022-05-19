const UserModel = require('../models/users/user.model');
const AccountModel = require('../models/users/account.model');
const TeacherModel = require('../models/users/teacher.model')


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



module.exports = {
    getUser,
    putUser,
    postActiveTeacherRole,
}