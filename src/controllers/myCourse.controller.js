const MyCourseModel = require("../models/users/myCourse.model");
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

// fn: lấy danh sách khoá học đã mua và phân trang
const getMyCourses = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, name } = req.query
        const { user } = req
        let query = [
            { $match: { user: ObjectId(user._id) } },
            {
                $lookup: {
                    from: "courses",
                    localField: 'course',
                    foreignField: "_id",
                    as: 'course'
                }
            },
            { $unwind: "$course" },
            {
                $lookup: {
                    from: "users",
                    localField: 'course.author',
                    foreignField: "_id",
                    as: 'course.author'
                }
            },
            { $unwind: "$course.author" },
            {
                $lookup: {
                    from: "chapters",
                    localField: 'course._id',
                    foreignField: "course",
                    as: 'chapters'
                }
            },
            { $unwind: "$chapters" },
            {
                $lookup: {
                    from: "lessons",
                    localField: 'chapters._id',
                    foreignField: "chapter",
                    as: 'chapters.lessons'
                }
            },

            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) },
            {
                $group: {
                    _id: "$_id",
                    course: { $first: "$course" },
                    chapters: { $push: "$chapters" },
                    progress: { $first: "$progress" },
                }
            },
            {
                $project: {
                    _id: 1,
                    "course": { _id: 1, name: 1, thumbnail: 1, slug: 1, author: { _id: 1, fullName: 1 }, description: 1 },
                    "chapters": { _id: 1, name: 1, lessons: { _id: 1, number: 1, title: 1, type: 1, video: 1, text: 1, slide: 1, description: 1, duration: 1 } },
                    "progress": 1,
                }
            }
        ]
        if (name) {
            query.push({ $match: { "course.name": new RegExp(name, 'img') } })
        }

        const myCourses = await MyCourseModel.aggregate(query)
        // tính phần trăm hoàn thành khoá học
        var result = myCourses.map(item => {
            let tu = 0
            item.progress.forEach(i => {
                i.complete ? tu++ : tu += 0
            })
            let mau = 0
            item.chapters.forEach(chapter => {
                mau += chapter.lessons.length
            })

            delete item.progress
            delete item.chapters
            item.percentProgress = tu * 100 / mau
            return item
        })
        res.status(200).json({ message: "ok", myCourses: result })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error" })
    }
}

// fn: lấy chi tiết các bài giảng khoá học đã mua
const getMyCourse = async (req, res, next) => {
    try {
        const { id } = req.params
        const { user } = req
        let query = [
            { $match: { _id: ObjectId(id), user: ObjectId(user._id) } },
            {
                $lookup: {
                    from: "courses",
                    localField: 'course',
                    foreignField: "_id",
                    as: 'course'
                }
            },
            { $unwind: "$course" },
            {
                $lookup: {
                    from: "users",
                    localField: 'course.author',
                    foreignField: "_id",
                    as: 'course.author'
                }
            },
            { $unwind: "$course.author" },
            {
                $lookup: {
                    from: "chapters",
                    localField: 'course._id',
                    foreignField: "course",
                    as: 'chapters'
                }
            },
            { $unwind: "$chapters" },
            {
                $lookup: {
                    from: "lessons",
                    localField: 'chapters._id',
                    foreignField: "chapter",
                    as: 'chapters.lessons'
                }
            },
            {
                $group: {
                    _id: "$_id",
                    course: { $first: "$course" },
                    chapters: { $push: "$chapters" },
                    progress: { $first: "$progress" },
                }
            },
            {
                $project: {
                    _id: 1,
                    "course": { _id: 1, name: 1, thumbnail: 1, slug: 1, author: { _id: 1, fullName: 1 }, description: 1 },
                    "chapters": { _id: 1, name: 1, lessons: { _id: 1, number: 1, title: 1, type: 1, video: 1, text: 1, slide: 1, description: 1, duration: 1 } },
                    "progress": 1,
                }
            }
        ]

        const myCourse = await MyCourseModel.aggregate(query)
        // tính phần trăm hoàn thành khoá học
        var result = myCourse.map(item => {
            let tu = 0
            item.progress.forEach(i => {
                i.complete ? tu++ : tu += 0
            })
            let mau = 0
            item.chapters.forEach(chapter => {
                mau += chapter.lessons.length
            })
            item.percentProgress = tu * 100 / mau
            return item
        })
        res.status(200).json({ message: "ok", myCourse: result[0] })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error" })

    }
}

// fn: cập nhật tiến trình cho từng bài giảng trong khoá học
const putProgress = async (req, res, next) => {
    try {
        const { id } = req.params
        const { lessonId, timeline, complete = false } = req.body

        const mc = await MyCourseModel.findById(id).lean()
        let isExisted = mc.progress.some(item => JSON.stringify(item.lessonId) == JSON.stringify(lessonId))
        if (isExisted) {
            await MyCourseModel.updateOne({ _id: id, 'progress.lessonId': lessonId }, {
                $set: { 'progress.$.timeline': timeline, 'progress.$.complete': complete == "true" }
            })
        } else {
            await MyCourseModel.updateOne({ _id: id }, { $push: { progress: { lessonId, timeline, complete: complete == "true" } } })
        }
        res.status(200).json({ message: "update oke" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error" })
    }
}


module.exports = {
    getMyCourses,
    getMyCourse,
    putProgress
}