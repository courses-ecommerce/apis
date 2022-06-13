const UserModel = require('../models/users/user.model');
const AccountModel = require('../models/users/account.model');
const TeacherModel = require('../models/users/teacher.model');
const CourseModel = require('../models/courses/course.model');



// fn: lấy list khoá học đã tạo
const getMyCourses = async (req, res, next) => {
    try {
        const { user } = req
        const { page = 1, limit = 10, sort, name } = req.query

        let query = [
            { $match: { author: user._id } },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
        ]
        if (name) {
            query.unshift({
                $match: { $text: { $search: name } }
            })
        }
        // sắp xếp và thống kê
        if (sort) {
            let [f, v] = sort.split('-')
            let sortBy = {}
            if (f == 'score') {
                query.push({ $sort: { score: { $meta: "textScore" }, rating: -1 } })
            } else if (f == 'rating') {
                sortBy["rating.rate"] = v == "asc" || v == 1 ? 1 : -1
                query.push({ $sort: sortBy })
            } else {
                sortBy[f] = v == "asc" || v == 1 ? 1 : -1
                query.push({ $sort: sortBy })
            }
        }

        const courses = await CourseModel.aggregate(query)
        query.push({ $count: "total" })
        const totalCourse = await CourseModel.aggregate(query)
        let total = totalCourse[0]?.total || 0
        res.status(200).json({ message: 'ok', total, courses })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'error' })
    }
}

// fn: lấy info teacher
const getMyInfo = async (req, res, next) => {
    try {
        const { id } = req.params
        const teacher = await TeacherModel.findById(id).lean()
        res.status(200).json({ message: "oke", teacher })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'error' })
    }
}

//fn: cập nhật teacher info
const putMyInfo = async (req, res, next) => {
    try {
        const { user } = req
        const newData = req.body
        if (newData.isVerified) {
            delete newData.isVerified
        }
        const teacher = await TeacherModel.findOneAndUpdate({ user: user._id }, newData, { new: true })
        res.status(200).json({ message: "update oke", teacher })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'error' })
    }
}

//fn: lấy thống kê doanh thu
const getMyRevenue = async (req, res, next) => {
    try {
        const { id } = req.user
        let query = [
            {
                $match: {
                    _id: ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'account',
                    foreignField: '_id',
                    as: 'account'
                }
            },
            {
                $unwind: '$account'
            },
            {
                $lookup: {
                    from: 'detailInvoices',
                    localField: '_id',
                    foreignField: 'courseAuthor',
                    as: 'detailInvoices'
                }
            },
            {
                $project: {
                    fullName: 1,
                    phone: 1,
                    birthday: 1,
                    gender: 1,
                    account: { email: 1, role: 1 },
                    detailInvoices: 1,
                }
            }
        ]
        // lấy data teacher
        const teacher = (await UserModel.aggregate(query))[0]
        // lấy hoá đơn có tác giả in users id
        const invoices = await DetailInvoiceModel.aggregate([
            {
                $match: {
                    courseAuthor: teacher._id
                }
            }
        ])
        teacher.revenue = 0
        teacher.numOfDetailInvoice = 0
        for (let i = 0; i < invoices.length; i++) {
            const element = invoices[i];
            if (JSON.stringify(teacher._id) == JSON.stringify(element.courseAuthor)) {
                teacher.revenue += element.amount
                teacher.numOfDetailInvoice++
            }
        }

        res.status(200).json({ message: "ok", teacher })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    getMyCourses,
    getMyInfo,
    putMyInfo,
    getMyRevenue
}