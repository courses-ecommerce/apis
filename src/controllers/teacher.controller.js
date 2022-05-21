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

}


module.exports = {
    getMyCourses,
    getMyInfo
}