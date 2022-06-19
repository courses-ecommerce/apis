const LessonModel = require('../models/courses/lesson.model');
const helper = require('../helper');
const UserModel = require('../models/users/user.model');
const AccountModel = require('../models/users/account.model');
const ChapterModel = require('../models/courses/chapter.model');
const CourseModel = require('../models/courses/course.model');
var fs = require('fs');


// fn: cho phép thao tác (chỉ author)
const isPermitted = async (req, res, next) => {
    try {
        const { user, account } = req
        const { id, chapter } = req.params
        if (chapter) {
            var ct = await ChapterModel.findById(chapter)
        } else {
            const lesson = await LessonModel.findById(id).lean()
            var ct = await ChapterModel.findById(lesson.chapter)
        }
        const c = await CourseModel.findById(ct.course).lean()
        if (JSON.stringify(c.author) !== JSON.stringify(user._id)) {
            return res.status(401).json({ message: "Unauthorize", error: error.message })
        }
        next()
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Unauthorize", error: error.message })
    }
}


// fn: tạo mới lesson
const postLesson = async (req, res, next) => {
    try {
        const { chapter, number, title, description } = req.body
        await LessonModel.create(req.body)
        res.status(201).json({ message: "create ok" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error", error: error.message })
    }
}


// fn: cập nhật lesson
const putLesson = async (req, res, next) => {
    try {
        const file = req.files['file'][0] // video/slide
        var resource
        try {
            resource = req.files['resource'][0] // resource
        } catch (error) {
            resource = null
        }
        const { id } = req.params
        const { chapter, number, title, description, type, text } = req.body

        if (resource) {
            const result = await helper.uploadFileToCloudinary(resource, id)
            if (result.error) {
                return res.status(500).json({ message: "Lỗi tải lên file (cloudinary)" })
            }
            req.body.resource = result.secure_url
        }
        // nếu type là video thì tính thời lượng video
        if (file) {
            if (type == "video") {
                const duration = await helper.getVideoDuration(file.path)
                req.body.duration = duration

                res.status(200).json({ message: "updating" })
                const result = await helper.uploadVideoToCloudinary(file, id)
                if (result.error) {
                    return res.status(500).json({ message: "Lỗi tải lên video (cloudinary)" })
                }
                req.body.video = [result.eager[0].secure_url, result.secure_url]
                await LessonModel.updateOne({ _id: id }, req.body)
                return
            } else if (file && type == "slide") {
                const result = await helper.uploadFileToCloudinary(file, id)
                if (result.error) {
                    return res.status(500).json({ message: "Lỗi tải lên file (cloudinary)" })
                }
                req.body.slide = result.secure_url
            }

        }

        // cập nhật lesson
        await LessonModel.updateOne({ _id: id }, req.body)
        res.status(200).json({ message: "updating oke" })

        fs.unlinkSync(resource.path);
        fs.unlinkSync(file.path);


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error", error: error.message })
    }
}


// fn: lấy detail lesson
const getLesson = async (req, res, next) => {
    try {
        const { id } = req.params

        const lesson = await LessonModel.findById(id).lean()

        lesson ? message = "Invalid id" : message = "ok"

        res.status(200).json({ message, lesson })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error", error: error.message })
    }
}

//fn: lấy lesson trong 1 chương bằng chapter id 
const getLessons = async (req, res, next) => {
    try {
        const { chapter } = req.query
        const lessons = await LessonModel.find({ chapter }).sort([['number', 1]]).lean()

        lessons ? message = "Chapter id required" : message = "ok"

        res.status(200).json({ message, lessons })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error", error: error.message })
    }
}



// fn: delete lesson (vẫn chưa xoá tài nguyên trên cloudinary)
const deleteLesson = async (req, res, next) => {
    try {
        const { id } = req.params
        const lesson = await LessonModel.findById(id).lean()

        lesson ? message = "Invalid id" : message = "delete ok"

        res.status(200).json({ message })

        await LessonModel.deleteOne({ _id: id })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error", error: error.message })
    }
}


module.exports = {
    isPermitted,
    postLesson,
    putLesson,
    getLesson,
    getLessons,
    deleteLesson
}