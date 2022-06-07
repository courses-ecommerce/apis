const ChapterModel = require('../models/courses/chapter.model');
const LessonModel = require('../models/courses/lesson.model');
const CourseModel = require('../models/courses/course.model');

// fn: xác thực
const isPermitted = async (req, res, next) => {
    try {
        const { id } = req.params
        const { user } = req
        const chapter = await ChapterModel.findById(id).lean()
        if (!chapter) {
            return res.status(400).json({ message: "Invalid id" })
        }
        const course = await CourseModel.findOne({ _id: chapter.course }).lean()
        // kiểm tra user có phải là author không
        if (JSON.stringify(user._id) === JSON.stringify(course.author)) {
            next()
        } else {
            return res.status(403).json({ message: "Not permitted" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}



// fn: tạo chapter mới
const postChapter = async (req, res, next) => {
    try {
        const { course, name, number } = req.body
        const { user } = req
        const c = await CourseModel.findById(course)
        if (JSON.stringify(user._id) !== JSON.stringify(c.author)) {
            return res.status(403).json({ message: "Not permitted" })
        }
        await ChapterModel.create({ number, course, name })
        res.status(201).json({ message: "ok" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

// fn: lấy danh sách chapter bằng mã khoá học (course id)
const getChapters = async (req, res, next) => {
    try {
        const { lesson = 'true', course } = req.query
        let query = []
        if (course) {
            query.unshift({
                $match: { course: ObjectId(course) }
            })
        }
        if (JSON.stringify(lesson) === JSON.stringify('true')) {
            query.push({
                $lookup: {
                    from: "lessons",
                    localField: "_id",
                    foreignField: "chapter",
                    as: "lessons"
                }
            })
        }
        query.push({
            $sort: { number: asc }
        })
        const chapters = await ChapterModel.aggregate(query)
        res.status(200).json({ message: "ok", chapters })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

// fn: cập nhật chapter by id
const putChapter = async (req, res, next) => {
    try {
        const { id } = req.params
        await ChapterModel.updateOne({ _id: id }, req.body)
        res.status(200).json({ message: " update ok" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

// fn: xoá chapter by id
const deleteChapter = async (req, res, next) => {
    try {
        const { id } = req.params
        // xoá chapter
        await ChapterModel.deleteOne({ _id: id })
        // xoá lesson liên quan
        await LessonModel.deleteMany({ chapter: id })
        res.status(200).json({ message: "delete ok" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}


module.exports = {
    postChapter,
    getChapters,
    putChapter,
    deleteChapter,
    isPermitted
}


