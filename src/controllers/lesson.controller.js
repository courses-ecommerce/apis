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
            var ct = await ChapterModel.findById(chapter).lean()
        } else {
            const lesson = await LessonModel.findById(id).lean()
            req.lesson = lesson
            var ct = await ChapterModel.findById(lesson.chapter).lean()
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
        var { chapter, number, title, description } = req.body
        number = parseInt(number)
        const objChapter = await ChapterModel.findById(chapter).lean()
        if (!objChapter) return res.status(400).json({ message: "Chapter not found" })
        // check lesson nào có number = number hay không? dời toàn bộ lesson có number > number
        const currentLesson = await LessonModel.findOne({ chapter, number })
        if (currentLesson) {
            await LessonModel.updateMany(
                { chapter, number: { $gte: number } },
                { $inc: { number: 1 } }
            )
        } else {
            const latestLesson = (await LessonModel.find({ chapter }).sort({ number: -1 }))[0]
            number = latestLesson?.number + 1 || 0
        }

        await LessonModel.create({ chapter, number, title, description })
        res.status(201).json({ message: "create ok" })
        const objCourse = await CourseModel.findById(objChapter.course).lean()
        if (objCourse.status == 'approved') {
            await CourseModel.updateOne({ _id: objCourse._id }, { status: "updating" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message, error: error.message })
    }
}


// fn: cập nhật lesson
const putLesson = async (req, res, next) => {
    try {
        var resource, file
        try {
            file = req.files['file'][0] // video/slide
        } catch (error) {
            file = null
        }
        try {
            resource = req.files['resource'][0] // resource
        } catch (error) {
            resource = null
        }
        const { id } = req.params
        const data = Object.fromEntries(Object.entries(req.body).filter(([_, v]) => v != null));
        var { number, title, description, type, text } = data
        number = parseInt(number)
        const { lesson } = req
        if (number) {
            let start, end, step
            if (number < lesson.number) {
                start = number - 1
                end = lesson.number
                step = 1
            } else {
                start = lesson.number
                end = number + 1
                step = -1
            }
            // cập nhật number các lesson khác.
            await LessonModel.updateMany({
                chapter: lesson.chapter,
                number: {
                    $gt: start,
                    $lt: end,
                }
            }, { $inc: { number: step } })
        }

        if (resource) {
            const result = await helper.uploadFileToCloudinary(resource, id)
            if (result.error) {
                return res.status(500).json({ message: "Lỗi tải lên file (cloudinary)" })
            }
            req.body.resource = result.secure_url
        }
        // nếu type là video thì tính thời lượng video
        if (file) {
            // if (type == "video") {
            const duration = await helper.getVideoDuration(file.path)
            req.body.duration = duration
            let videoInfo = {
                name: file.originalname,
                size: (file.size / 1000000).toFixed(2) + " mb",
                createdAt: new Date(),
                status: "pending",
                type: file.mimetype
            }
            const info = await LessonModel.findOneAndUpdate({ _id: id }, { videoInfo, ...data, publish: false }, { new: true })
            res.status(200).json({ message: "oke", info })
            const result = await helper.uploadVideoToCloudinary(file, id)
            if (result.error) {
                console.log(result);
                videoInfo.status = "failure"
                await LessonModel.updateOne({ _id: id }, { videoInfo })
                return
            }
            videoInfo.status = "success"
            let video = [result.eager[0].secure_url, result.secure_url]
            await LessonModel.updateOne({ _id: id }, { videoInfo, video })
            try {
                fs.unlinkSync(resource.path);
            } catch (error) { }
            try {
                fs.unlinkSync(file.path);
            } catch (error) { }
            return
            // } else if (file && type == "slide") {
            //     const result = await helper.uploadFileToCloudinary(file, id)
            //     if (result.error) {
            //         return res.status(500).json({ message: "Lỗi tải lên file (cloudinary)" })
            //     }
            //     req.body.slide = result.secure_url
            // }

        }

        // cập nhật lesson
        await LessonModel.updateOne({ _id: id }, data)
        res.status(200).json({ message: "updating oke" })

        try {
            fs.unlinkSync(resource.path);
        } catch (error) { }
        try {
            fs.unlinkSync(file.path);
        } catch (error) { }


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message, error: error.message })
    }
}


// fn: lấy detail lesson
const getLesson = async (req, res, next) => {
    try {
        const { id } = req.params

        const lesson = await LessonModel.findById(id).lean()

        lesson ? message = "ok" : message = "Invalid id"

        res.status(200).json({ message, lesson })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message, })
    }
}

//fn: lấy lesson trong 1 chương bằng chapter id 
const getLessons = async (req, res, next) => {
    try {
        const { chapter } = req.query
        const lessons = await LessonModel.find({ chapter }).sort([['number', 1]]).lean()

        lessons ? message = "ok" : message = "Chapter id required"

        res.status(200).json({ message, lessons })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message, })
    }
}



// fn: delete lesson (vẫn chưa xoá tài nguyên trên cloudinary)
const deleteLesson = async (req, res, next) => {
    try {
        const { id } = req.params
        const lesson = await LessonModel.findById(id).lean()

        // update number của các lesson có number > lesson.number
        await LessonModel.updateMany(
            { chapter: lesson.chapter, number: { $gt: lesson.number } },
            { $inc: { number: -1 } }
        )
        lesson ? message = "delete ok" : message = "Invalid id"

        res.status(200).json({ message })

        await LessonModel.deleteOne({ _id: id })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message, error: error.message })
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