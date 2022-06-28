const CourseModel = require('../models/courses/course.model');
const ChapterModel = require('../models/courses/chapter.model');
const LessonModel = require('../models/courses/lesson.model');
const RateModel = require('../models/courses/rate.model');
const CommentModel = require('../models/courses/comment.model');
const HistorySearchModel = require('../models/users/historySearch.model');
const HistoryViewModel = require('../models/users/historyView.model');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const didYouMean = require('google-did-you-mean')
const helper = require('../helper');
const MyCourseModel = require('../models/users/myCourse.model');
var fs = require('fs');


const setData = async (req, res) => {
    try {
        const name = [
            {
                name: "IELTS General Writing - The Complete Guide",
                category: "62ac7383710ee00b2af53e92",
                author: "62ac752f6cb5fd8fb627a976",

                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397240/thumbnail/1656397204917.jpg"
            },
            {
                name: "IELTS Advanced Speaking (Band 8-9)",
                category: "62ac7383710ee00b2af53e92",
                author: "62ac752f6cb5fd8fb627a976",
                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397300/thumbnail/1656397265221.jpg"

            },
            {
                name: "IELTS Step-by-step | Mastering Reading",
                category: "62ac7383710ee00b2af53e92",
                author: "62ac75366cb5fd8fb627aa1a",
                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397316/thumbnail/1656397281304.jpg"

            },
            {
                name: "IELTS Complete Preparation for (Academic & General)",
                category: "62ac7383710ee00b2af53e92",
                author: "62ac75366cb5fd8fb627aa1a",
                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397328/thumbnail/1656397293992.jpg"

            },
            {
                name: "IELTS Daily - Speaking Starter Course",
                author: "62ac75366cb5fd8fb627aa22",
                category: "62ac7383710ee00b2af53e92",
                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397340/thumbnail/1656397305688.jpg"

            },
            {
                name: "Complete English Common Errors Practice Test for all Exams",
                category: "62ac7374710ee00b2af53e8d",
                author: "62ac75366cb5fd8fb627aa22",

                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397350/thumbnail/1656397315387.jpg"

            },
            {
                name: "English Placement Practice Test (EPT)- MCQs",
                category: "62ac7374710ee00b2af53e8d",
                author: "62ac75366cb5fd8fb627aa22",

                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397361/thumbnail/1656397326700.jpg"

            },
            {
                name: "TOEFL Master Class with Andrea",
                category: "62ac73ae710ee00b2af53e97",
                author: "62ac75366cb5fd8fb627aa2a",

                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397370/thumbnail/1656397336176.jpg"

            },
            {
                name: "TOEFL iBT (The Complete Course)",
                category: "62ac73ae710ee00b2af53e97",
                author: "62ac75366cb5fd8fb627aa2a",

                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397388/thumbnail/1656397353430.jpg"

            },
            {
                name: "TOEFL iBT® – Test Of English as Foreign Language 2022",
                author: "62ac75366cb5fd8fb627aa2a",

                category: "62ac73ae710ee00b2af53e97", thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397183/thumbnail/1656397148757.jpg"

            },
            {
                name: "TOEFL Strategies: A Complete Guide to the iBT",
                category: "62ac73ae710ee00b2af53e97",
                author: "62b8631caf468acd479d64e0",

                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397240/thumbnail/1656397204917.jpg"


            },
            {
                name: "TOEFL English Vocabulary",
                category: "62ac73ae710ee00b2af53e97",
                author: "62b8631caf468acd479d64e0",

                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397300/thumbnail/1656397265221.jpg"

            },
            {
                name: "English Academic Writing Skills for TOEFL & IELTS",
                category: "62ac73ae710ee00b2af53e97",
                author: "62b8631caf468acd479d64e0",

                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397316/thumbnail/1656397281304.jpg"

            },
            {
                name: "English Made Simple: Vocabulary For TOEFL",
                category: "62ac73ae710ee00b2af53e97",
                author: "62b8631caf468acd479d64e0",

                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397328/thumbnail/1656397293992.jpg"

            },
            {
                name: "English Grammar Complete | All English Sentence Patterns",
                category: "62ac7361710ee00b2af53e83",
                author: "62b8631caf468acd479d64e0",

                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397340/thumbnail/1656397305688.jpg"

            },
            {
                name: "English Grammar| 50 English Grammar Mistakes people make",
                category: "62ac7361710ee00b2af53e83",
                author: "62b8631caf468acd479d64e0",

                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397350/thumbnail/1656397315387.jpg"

            },
            {
                name: "The English Conversation Course | Learn to speak English!",
                category: "62ac7361710ee00b2af53e83",
                author: "62b8631caf468acd479d64e0",

                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397361/thumbnail/1656397326700.jpg"

            },
            {
                name: "The Complete English Grammar Course - from A1 to C1 level",
                category: "62ac7361710ee00b2af53e83",
                author: "62b8631caf468acd479d64e0",

                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397370/thumbnail/1656397336176.jpg"

            },
            {
                name: "Basic English Grammar & Structures | A1-A2 Elementary Level",
                category: "62ac7361710ee00b2af53e83",
                author: "62b8631caf468acd479d64e0",

                thumbnail: "https://res.cloudinary.com/uthcmc/image/upload/v1656397388/thumbnail/1656397353430.jpg"

            }
        ]

        const prices = [
            {
                originalPrice: 1600000,
                currentPrice: 1300000,
            },
            {
                originalPrice: 1200000,
                currentPrice: 1100000,
            },
            {
                originalPrice: 2000000,
                currentPrice: 1800000,
            },
            {
                originalPrice: 2600000,
                currentPrice: 1300000,
            },
            {
                originalPrice: 3000000,
                currentPrice: 2700000,
            },
            {
                originalPrice: 1200000,
                currentPrice: 900000,
            },
        ]

        const data = {
            "description": "Challenge - English Proficiency Test Course and App is the best way to improve your English grammar skills. ThisEnglish Proficiency Test helps you to learn the rules of grammar in English language. This can be done moreeasily by practicing the grammar exercises and taking regular grammar lessons in this app.But here’s the fun part, you don’t learn the regular, instead a more engaging, exciting and eccentric gameeducation hybrid. Take up on the challenging exercises, or cool off in our in app Game Arena. Start yourcorporate journey as a fresh internee, and then learn and grow your way up the promotion ladder, where thepossibilities are endless. Ace the app, and you’ll find yourself on top the food chain, the next CEO positionawaits!If you are looking for an offline grammar tests or English grammar offline app, this English Proficiency Test isthe right choice for you. This proficiency app is mainly designed for students, prospective candidates forcompetitive exams, beginning stage of English learners.This English proficiency test app makes your communication skills efficient in written English language through adual module system:Module 1 - Lessons 1 to 36 train you thoroughly in reading and writing, and getting prepped for advanced lessonsaheadModule 2 - Lessons 37 and onwards are an even specialized set of exercises involving listening, writing andreading to take the next step in your English skills.Test and improve your language knowledge and English grammar easily with this “English Proficiency Test",
            "lang": "en",
            "intendedLearners": [
                "Internacional students"
            ],
            "requirements": [
                "Intermediate English, Computer, Headset and Microphone, Internet, App TChallenge"
            ],
            "targets": [
                "+72 lessons including vocabulary, grammar and text interpretation",
                "Learning enviroment in a game scene, you from Training to CEO",
                "Complete Course Substitute for In-Person Classes",
                "+4500 exercises in an exclusive gaming app"
            ],
            "level": "all",
        }

        name.forEach(async item => {
            let i = Math.floor(Math.random() * 6);
            let originalPrice = prices[i].originalPrice
            let currentPrice = prices[i].currentPrice
            let saleOff = (1 - parseInt(currentPrice) / parseInt(originalPrice)) * 100 || 0

            const course = await CourseModel.create({
                name: item.name,
                category: item.category,
                thumbnail: item.thumbnail,
                author: item.author,
                description: data.description,
                lang: data.lang,
                intendedLearners: data.intendedLearners,
                requirements: data.requirements,
                targets: data.targets,
                level: data.level,
                originalPrice,
                currentPrice,
                saleOff,
                status: "approved",
                publish: true
            })
            if (course) {
                let chapter = await ChapterModel.create({ course, name: "Mở đầu", number: 1 })
                await LessonModel.create(
                    { chapter, "number": 1, "title": "Làm quen với cách học", "type": "video", "video": ["https://res.cloudinary.com/uthcmc/video/upload/sp_hd/v1655649599/videos/62af313b1ad5916fca2b4347-1655649572937.m3u8", "https://res.cloudinary.com/uthcmc/video/upload/v1655649599/videos/62af313b1ad5916fca2b4347-1655649572937.mp4"], "text": null, "slide": null, "description": "", "saveIn": "cloudinary", "publish": true, "duration": "22.207", "resource": null }
                )
                await LessonModel.create(
                    { chapter, "number": 2, "title": "Cách luyện nghe", "type": "video", "video": ["https://res.cloudinary.com/uthcmc/video/upload/sp_hd/v1655655026/videos/62af314e1ad5916fca2b434b-1655655004525.m3u8", "https://res.cloudinary.com/uthcmc/video/upload/v1655655026/videos/62af314e1ad5916fca2b434b-1655655004525.mp4"], "text": null, "slide": null, "description": "", "saveIn": "cloudinary", "publish": true, "duration": "11.26", "resource": null, })
                await LessonModel.create(
                    { chapter, "number": 3, "title": "Cách luyện nói", "type": "video", "video": ["https://res.cloudinary.com/uthcmc/video/upload/sp_hd/v1655655099/videos/62af31541ad5916fca2b434f-1655655076812.m3u8", "https://res.cloudinary.com/uthcmc/video/upload/v1655655099/videos/62af31541ad5916fca2b434f-1655655076812.mp4"], "text": null, "slide": null, "description": "", "saveIn": "cloudinary", "publish": true, "duration": "25.158333", "resource": null, })
                await LessonModel.create(
                    { chapter, "number": 4, "title": "Cách luyện đọc", "type": "video", "video": ["https://res.cloudinary.com/uthcmc/video/upload/sp_hd/v1655655147/videos/62af315a1ad5916fca2b4353-1655655125187.m3u8", "https://res.cloudinary.com/uthcmc/video/upload/v1655655147/videos/62af315a1ad5916fca2b4353-1655655125187.mp4"], "text": null, "slide": null, "description": "", "saveIn": "cloudinary", "publish": true, "duration": "18.541667", "resource": null, })
                chapter = await ChapterModel.create({ course, name: "Chương 2", number: 2 })

                await LessonModel.create(
                    { chapter, "number": 1, "title": "Cách làm bài thi", "type": "video", "video": ["https://res.cloudinary.com/uthcmc/video/upload/sp_hd/v1655655427/videos/62af4b4435f5d31c45f8f20d-1655655398076.m3u8", "https://res.cloudinary.com/uthcmc/video/upload/v1655655427/videos/62af4b4435f5d31c45f8f20d-1655655398076.mp4"], "text": null, "slide": null, "description": null, "saveIn": "cloudinary", "publish": true, "duration": "59.258333", "resource": null, "__v": 0 }
                )
                await LessonModel.create(
                    { chapter, "number": 2, "title": "Thực hành", "type": "video", "video": ["https://res.cloudinary.com/uthcmc/video/upload/sp_hd/v1655655435/videos/62af4b5635f5d31c45f8f211-1655655411896.m3u8", "https://res.cloudinary.com/uthcmc/video/upload/v1655655435/videos/62af4b5635f5d31c45f8f211-1655655411896.mp4"], "text": null, "slide": null, "description": null, "saveIn": "cloudinary", "publish": true, "duration": "25.058333", "resource": null, }
                )
            }
        })
        res.send("ok")
    } catch (error) {

    }
}

//#region  courses

//fn: Thêm khoá học
const postCourse = async (req, res, next) => {
    try {
        const author = req.user
        const account = req.account
        const image = req.file
        const { name, category, description, lang, intendedLearners, requirements, targets, level, currentPrice, originalPrice, hashtags = [] } = req.body
        // // tags is array
        if (account.role != 'teacher') {
            return res.status(401).json({ message: "Not permited" })
        }
        // xác thực dữ liệu
        if (currentPrice && parseInt(currentPrice) < 0) {
            return res.status(400).json({ message: "currentPrice phải lớn hơn hoặc bằng 0" })
        }
        if (originalPrice && parseInt(originalPrice) < 0) {
            return res.status(400).json({ message: "originalPrice phải lớn hơn hoặc bằng 0" })
        }
        if (originalPrice && currentPrice && parseInt(originalPrice) < parseInt(currentPrice)) {
            return res.status(400).json({ message: "originalPrice phải lớn hơn hoặc bằng currentPrice" })
        }

        // tính giảm giá
        let saleOff = (1 - parseInt(currentPrice) / parseInt(originalPrice)) * 100 || 0
        // upload image lên cloud
        let thumbnail = await helper.uploadImageToCloudinary(image, name)
        // tạo khoá học
        const course = await CourseModel.create(
            { name, category, description, currentPrice, originalPrice, saleOff, author, thumbnail, lang, intendedLearners, requirements, targets, level, hashtags }
        )
        if (course) {
            const chapter = await ChapterModel.create({ course, name: "Default", number: 1 })
            await LessonModel.create({
                chapter,
                number: 1,
                title: "Default"
            })
        }
        res.status(201).json({ message: "ok" })
        try {
            fs.unlinkSync(image.path);
        } catch (error) {

        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "error 1" })
    }
}

// fn: Cập nhật khoá học: (thêm markdown cho description)
// Note: không cho phép cập nhật sellNumber, teacher không được phép cập nhật publish
const putCourse = async (req, res, next) => {
    try {
        const user = req.user
        const image = req.file
        const account = req.account
        const { slug } = req.params
        var newCourse = req.body
        let content = newCourse.content
        delete newCourse.content
        // lấy thông tin hiện tại
        const course = await CourseModel.findOne({ slug }).lean()
        if (!course) return res.status(404).json({ message: "Course not found!" })
        if (image) {
            // upload image lên cloud
            let thumbnail = await helper.uploadImageToCloudinary(image, slug)
            newCourse.thumbnail = thumbnail
        }
        // tránh hacker
        if (newCourse.sellNumber) {
            delete newCourse.sellNumber
        }
        // chỉ cho phép admin cập nhật publish
        if (newCourse.publish) {
            if (account.role == "admin") {
                newCourse.publish = JSON.stringify(newCourse.publish) == "true"
            } else {
                delete newCourse.publish
            }
        }

        // check permit 
        if (account.role !== "admin" && JSON.stringify(user._id) !== JSON.stringify(course.author)) {
            return res.status(401).json({ message: "not permited" })
        }

        if (newCourse.currentPrice || newCourse.originalPrice) {
            let cp = newCourse.currentPrice || course.currentPrice
            let op = newCourse.originalPrice || course.originalPrice
            newCourse.saleOff = (1 - parseInt(cp) / parseInt(op)) * 100 || 0
        }

        // cập nhật theo id
        await CourseModel.updateOne({ _id: course._id }, newCourse)
        res.status(200).json({ message: 'ok' })
        // gửi mail thông báo lý do nếu k cho phép

        if (account.role == "admin" && newCourse.publish == false) {
            content
        }
        try {
            fs.unlinkSync(image.path);
        } catch (error) {
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}


// fn: Lấy tất cả khoá học và phân trang
// ex: ?sort=score&name=api&category=web-development&price=10-50&hashtags=nodejs-mongodb&rating=4.5
const getCourses = async (req, res, next) => {
    try {
        const { user } = req
        var { page = 1, limit = 10, sort, name, category, min, max, hashtags, rating, level, publish = 'true', status, author } = req.query
        const nSkip = (parseInt(page) - 1) * parseInt(limit)
        let searchKey = await didYouMean(name) || null
        let aCountQuery = [
            { $match: { publish: publish == 'true' } },
            {
                // tính rate trung bình
                $lookup: {
                    from: 'rates',
                    localField: '_id',
                    foreignField: 'course',
                    pipeline: [
                        {
                            $group: {
                                _id: '$course',
                                rate: { $avg: '$rate' },
                                numOfRate: { $count: {} }
                            }
                        }
                    ],
                    as: 'rating'
                }
            },
            {
                $unwind: {
                    "path": "$rating",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $lookup: {
                    from: 'categorys',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: "$author"
            },
            {
                $unwind: {
                    "path": "$category",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $project: {
                    'slug': 1,
                    'name': 1,
                    'category._id': 1,
                    'category.name': 1,
                    'category.slug': 1,
                    'thumbnail': 1,
                    'description': 1,
                    'language': 1,
                    'intendedLearners': 1,
                    'requirements': 1,
                    'targets': 1,
                    'level': 1,
                    'currentPrice': 1,
                    'originalPrice': 1,
                    'saleOff': 1,
                    'author._id': 1,
                    'author.fullName': 1,
                    'sellNumber': 1,
                    'hashtags': 1,
                    'type': 1,
                    'rating.rate': 1,
                    'rating.numOfRate': 1,
                    'createdAt': {
                        $dateToString: {
                            date: "$createdAt",
                            format: '%Y-%m-%dT%H:%M:%S',
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    },
                    'updatedAt': {
                        $dateToString: {
                            date: "$updatedAt",
                            format: '%Y-%m-%dT%H:%M:%S',
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    },
                    'status': 1,
                    //'score': { $meta: "textScore" },
                }
            },
        ]
        // aggrate query
        let aQuery = [
            { $match: { publish: publish == 'true' } },
            {
                // tính rate trung bình
                $lookup: {
                    from: 'rates',
                    localField: '_id',
                    foreignField: 'course',
                    pipeline: [
                        {
                            $group: {
                                _id: '$course',
                                rate: { $avg: '$rate' },
                                numOfRate: { $count: {} }
                            }
                        }
                    ],
                    as: 'rating'
                }
            },
            {
                $unwind: {
                    "path": "$rating",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $lookup: {
                    from: 'categorys',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: "$author"
            },
            {
                $unwind: {
                    "path": "$category",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $project: {
                    'slug': 1,
                    'name': 1,
                    'category._id': 1,
                    'category.name': 1,
                    'category.slug': 1,
                    'thumbnail': 1,
                    'description': 1,
                    'language': 1,
                    'intendedLearners': 1,
                    'requirements': 1,
                    'targets': 1,
                    'level': 1,
                    'currentPrice': 1,
                    'originalPrice': 1,
                    'saleOff': 1,
                    'author._id': 1,
                    'author.fullName': 1,
                    'sellNumber': 1,
                    'hashtags': 1,
                    'type': 1,
                    'rating.rate': 1,
                    'rating.numOfRate': 1,
                    'createdAt': {
                        $dateToString: {
                            date: "$createdAt",
                            format: '%Y-%m-%dT%H:%M:%S',
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    },
                    'updatedAt': {
                        $dateToString: {
                            date: "$updatedAt",
                            format: '%Y-%m-%dT%H:%M:%S',
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    },
                    'status': 1,
                    //'score': { $meta: "textScore" },
                }
            },

        ]
        // tìm theo tên
        if (name) {
            // nếu người dùng đã đăng nhập thì lưu lịch sử tìm kiếm (chỉ lưu 10 lần gần nhất)
            if (req.user) {
                await HistorySearchModel.findOneAndUpdate(
                    { user: req.user._id },
                    {
                        $push: {
                            historySearchs: {
                                $each: [name],
                                $position: 0,
                                $slice: 10
                            }
                        }
                    },
                    { upsert: true }
                )
            }
            if (searchKey.suggestion) {
                searchKey.original = name
                name = searchKey.suggestion
            }
            aQuery.unshift({
                $match: { $text: { $search: name } }
            })
            aCountQuery.unshift({
                $match: { $text: { $search: name } }
            })
        }
        // tìm theo số đánh giá
        if (rating) {
            aQuery.push({
                $match: { "rating.rate": { $gte: parseFloat(rating) } }
            })
            aCountQuery.push({
                $match: { "rating.rate": { $gte: parseFloat(rating) } }
            })
        }
        // tìm theo keyword
        if (hashtags) {
            aQuery.push({
                $match: { hashtags: { $all: hashtags.split("-") } }
            })
            aCountQuery.push({
                $match: { hashtags: { $all: hashtags.split("-") } }
            })
        }
        // tìm theo tác giả
        if (author) {
            aQuery.push(
                {
                    $match: { "author._id": ObjectId(author) }
                }
            )
            aCountQuery.push({
                $match: { "author._id": ObjectId(author) }
            })
        }
        // tìm theo category slug
        if (category && category !== 'all') {
            aQuery.push(
                { $match: { 'category.slug': category } }
            )
            aCountQuery.push(
                { $match: { 'category.slug': category } }
            )
        }
        // tìm status
        if (status) {
            aQuery.push(
                { $match: { status } }
            )
            aCountQuery.push(
                { $match: { status } }
            )
        }
        // tìm theo level
        if (level) {
            aQuery.push(
                { $match: { level: level } }
            )
            aCountQuery.push(
                { $match: { level: level } }
            )
        }
        // tìm theo giá từ min-max
        if (min) {
            min = parseInt(min)
            aQuery.push(
                { $match: { currentPrice: { $gte: min } } }
            )
            aCountQuery.push(
                { $match: { currentPrice: { $gte: min } } }
            )
        }
        if (max) {
            max = parseInt(max)
            aQuery.push(
                { $match: { currentPrice: { $lte: max } } }
            )
            aCountQuery.push(
                { $match: { currentPrice: { $lte: max } } }
            )
        }
        // sắp xếp và thống kê
        if (sort && sort !== "default") {
            let [f, v] = sort.split('-')
            let sortBy = {}
            if (f == 'score') {
                aQuery.push({ $sort: { score: { $meta: "textScore" }, rating: -1 } })
            } else if (f == 'rating') {
                sortBy["rating.rate"] = v == "asc" || v == 1 ? 1 : -1
                aQuery.push({ $sort: sortBy })
            } else {
                sortBy[f] = v == "asc" || v == 1 ? 1 : -1
                aQuery.push({ $sort: sortBy })
            }
        }

        // nếu user đã login => loại những khoá học đã mua
        if (user) {
            let khoaHocDaMuas = await MyCourseModel.find({ user }).lean()
            let exceptIds = khoaHocDaMuas.map(item => item.course)
            aQuery.splice(1, 0, { $match: { _id: { $nin: exceptIds } } })
            aCountQuery.splice(1, 0, { $match: { _id: { $nin: exceptIds } } })
        }

        if (page && limit) {
            aQuery.push(
                { $skip: nSkip },
                { $limit: parseInt(limit) }
            )
        }

        console.log((aQuery));

        const courses = await CourseModel.aggregate(aQuery)
        aCountQuery.push({ $count: "total" })
        const totalCourse = await CourseModel.aggregate(aCountQuery)
        let total = totalCourse[0]?.total || 0

        return res.status(200).json({ message: 'ok', searchKey, total, courses })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "error" })
    }
}

// fn: Xem khoá học theo slug
const getCourse = async (req, res, next) => {
    try {
        const { slug } = req.params
        const { user } = req

        const course = await CourseModel.aggregate([
            {
                $match: { slug: slug }
            },
            {   // tính rate trung bình
                $lookup: {
                    from: 'rates',
                    localField: '_id',
                    foreignField: 'course',
                    pipeline: [
                        {
                            $group: {
                                _id: '$course',
                                rate: { $avg: '$rate' },
                                numOfRate: { $count: {} },
                                star5: { $sum: { $cond: [{ $eq: ['$rate', 5] }, 1, 0] } },
                                star4: { $sum: { $cond: [{ $eq: ['$rate', 4] }, 1, 0] } },
                                star3: { $sum: { $cond: [{ $eq: ['$rate', 3] }, 1, 0] } },
                                star2: { $sum: { $cond: [{ $eq: ['$rate', 2] }, 1, 0] } },
                                star1: { $sum: { $cond: [{ $eq: ['$rate', 1] }, 1, 0] } },
                            },
                        }
                    ],
                    as: 'rating'
                }
            },
            {
                $unwind: {
                    "path": "$rating",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $unwind: "$author"
            },
            {
                $lookup: {
                    from: 'categorys',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: "$category"
            },
            {
                $lookup: {
                    from: 'chapters',
                    localField: '_id',
                    foreignField: 'course',
                    as: 'chapters'
                }
            },
            {
                $unwind: {
                    path: "$chapters",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'lessons',
                    localField: 'chapters._id',
                    foreignField: 'chapter',
                    as: 'chapters.lessons'
                }
            },
            {
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    slug: { $first: "$slug" },
                    category: { $first: "$category" },
                    thumbnail: { $first: "$thumbnail" },
                    description: { $first: "$description" },
                    lang: { $first: "$lang" },
                    intendedLearners: { $first: "$intendedLearners" },
                    requirements: { $first: "$requirements" },
                    targets: { $first: "$targets" },
                    level: { $first: "$level" },
                    currentPrice: { $first: "$currentPrice" },
                    originalPrice: { $first: "$originalPrice" },
                    saleOff: { $first: "$saleOff" },
                    rating: { $first: "$rating" },
                    author: { $first: "$author" },
                    hashtags: { $first: "$hashtags" },
                    sellNumber: { $first: "$sellNumber" },
                    publish: { $first: "$publish" },
                    status: { $first: "$status" },
                    chapters: { $push: "$chapters" },
                    createdAt: { $first: "$createdAt" },
                    type: { $first: "$type" },
                }
            },
            {
                $project: {
                    'slug': 1,
                    'name': 1,
                    'category._id': 1,
                    'category.name': 1,
                    'category.slug': 1,
                    'thumbnail': 1,
                    'description': 1,
                    'lang': 1,
                    'intendedLearners': 1,
                    'requirements': 1,
                    'targets': 1,
                    'level': 1,
                    'currentPrice': 1,
                    'originalPrice': 1,
                    'saleOff': 1,
                    'sellNumber': 1,
                    'rating.rate': 1,
                    'rating.numOfRate': 1,
                    'rating.star5': 1,
                    'rating.star4': 1,
                    'rating.star3': 1,
                    'rating.star2': 1,
                    'rating.star1': 1,
                    'author._id': 1,
                    'author.fullName': 1,
                    'hashtags': 1,
                    'publish': 1,
                    'type': 1,
                    'status': 1,
                    'createdAt': {
                        $dateToString: {
                            date: "$createdAt",
                            format: '%Y-%m-%dT%H:%M:%S',
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    },
                    'chapters': { _id: 1, number: 1, name: 1, lessons: { _id: 1, number: 1, title: 1, description: 1 } },
                }
            },
        ])
        if (course[0]) {
            if (user) {
                const myCourse = await MyCourseModel.findOne({ user, course: course[0] }).lean()
                if (myCourse) {
                    course[0].isBuyed = true
                }
            }
            if (!course[0].chapters[0].name) { course[0].chapters = [] }
            res.status(200).json({ message: 'ok', course: course[0] })
        } else {
            res.status(404).json({ message: 'mã khoá học không tồn tại' })
        }
        // lưu lịch sử xem
        if (user && course[0]) {
            await HistoryViewModel.findOneAndUpdate(
                { user: req.user._id },
                {
                    $push: {
                        historyViews: {
                            $each: [course[0]._id],
                            $position: 0,
                            $slice: 10
                        }
                    }
                },
                { upsert: true }
            )
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}

// fn: Xem danh sách khoá học liên quan theo slug (category, hashtags, rating)
const getRelatedCourses = async (req, res, next) => {
    try {
        const { slug } = req.params
        const { page = 1, limit = 12 } = req.query
        // course
        const course = await CourseModel.findOne({ slug: slug }).lean()
        if (!course) {
            return res.status(404).json({ message: "Not found" })
        }
        // tìm khoá học liên quan theo hasgtag
        const courses = await CourseModel.aggregate([
            {
                $match: {
                    $and: [
                        { category: course.category },
                        { _id: { $ne: ObjectId(course._id) } },
                        { publish: true },
                    ]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $lookup: {
                    from: 'categorys',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$author' },
            { $unwind: '$category' },
            {
                $lookup: {
                    from: 'rates',
                    localField: '_id',
                    foreignField: 'course',
                    pipeline: [
                        {
                            $group: {
                                _id: '$course',
                                rate: { $avg: '$rate' },
                                numOfRate: { $count: {} }
                            }
                        }
                    ],
                    as: 'rating'
                }
            },
            {
                $unwind: {
                    "path": "$rating",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $sort: { rating: -1 }
            },
            {
                $skip: (parseInt(page) - 1) * parseInt(limit)
            },
            {
                $limit: parseInt(limit)
            }
        ])
        const totalCount = await CourseModel.aggregate([
            {
                $match: {
                    $and: [
                        { category: course.category },
                        { _id: { $ne: ObjectId(course._id) } },
                        { publish: true },
                    ]
                }
            },
            {
                $count: 'total'
            }
        ])
        let total = totalCount[0]?.total || 0
        return res.status(200).json({ message: 'ok', total, courses })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}


// fn: gợi ý khoá học 
const getSuggestCourses = async (req, res, next) => {
    try {
        // lấy lịch sử tìm kiếm
        // xem tag nào nhiều nhất => course có tag đó
        const { limit = 10 } = req.query
        const user = req.user
        let searchKey = {}
        var courses = []
        var keyword = ''
        var query = [
            {
                // tính rate trung bình
                $lookup: {
                    from: 'rates',
                    localField: '_id',
                    foreignField: 'course',
                    pipeline: [
                        {
                            $group: {
                                _id: '$course',
                                rate: { $avg: '$rate' },
                                numOfRate: { $count: {} }
                            }
                        }
                    ],
                    as: 'rating'
                }
            },
            {
                $unwind: {
                    "path": "$rating",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $lookup: {
                    from: 'categorys',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: "$author"
            },
            {
                $unwind: {
                    "path": "$category",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $project: {
                    'slug': 1,
                    'name': 1,
                    'category._id': 1,
                    'category.name': 1,
                    'category.slug': 1,
                    'thumbnail': 1,
                    'description': 1,
                    'language': 1,
                    'intendedLearners': 1,
                    'requirements': 1,
                    'targets': 1,
                    'level': 1,
                    'currentPrice': 1,
                    'originalPrice': 1,
                    'saleOff': 1,
                    'author._id': 1,
                    'author.fullName': 1,
                    'sellNumber': 1,
                    'hashtags': 1,
                    'type': 1,
                    'rating.rate': 1,
                    'rating.numOfRate': 1,
                    'createdAt': {
                        $dateToString: {
                            date: "$createdAt",
                            format: '%Y-%m-%dT%H:%M:%S',
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    },
                    'updatedAt': {
                        $dateToString: {
                            date: "$updatedAt",
                            format: '%Y-%m-%dT%H:%M:%S',
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    },
                    'status': 1,
                    //'score': { $meta: "textScore" },
                }
            },
            { $limit: parseInt(limit) }
        ]
        if (user) {
            // nếu có user
            if (user) {
                let khoaHocDaMuas = await MyCourseModel.find({ user }).lean()
                let exceptIds = khoaHocDaMuas.map(item => item.course)
                query.unshift({ $match: { _id: { $nin: exceptIds } } })
            }
            // lấy first recent search
            const historySearchOfUser = await HistorySearchModel.findOne({ user: user._id }).lean()
            keyword = historySearchOfUser ? historySearchOfUser.historySearchs[0] : null
            if (keyword) {
                searchKey = await didYouMean(keyword)
                if (searchKey.suggestion) {
                    searchKey.original = keyword
                    keyword = searchKey.suggestion
                }
                query.unshift({
                    $match: { $text: { $search: keyword }, publish: true }
                })
                // tìm khoá học liên quan lịch sử tìm kiếm
                courses = await CourseModel.aggregate(query)
            } else {
                let historyViews = await HistoryViewModel.findOne({ user }).lean()
                let courseId = historyViews?.historyViews[0]
                if (courseId) {
                    let data = await CourseModel.findOne({ _id: courseId }).lean()
                    req.params.slug = data.slug
                    courses = await getRelatedCourses(req, res, next)
                    return
                } else {
                    return res.status(200).json({ message: "ok", courses: [] })
                }
            }
        }
        return res.status(200).json({ message: "ok", keyword, courses })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "error" })
    }
}

// fn: Xem danh sách khoá học hot (sellNumber)
// get /hot?category=slug
const getHotCourses = async (req, res, next) => {
    try {
        const { user } = req
        const { page, limit, category } = req.query
        let aQuery = []
        let countQuery = []
        if (category) {
            aQuery.unshift({
                $match: { "category.slug": category }
            })
            countQuery.unshift({
                $match: { "category.slug": category }
            })
        }
        countQuery.push(
            { $match: { publish: true, type: { $in: ["Hot", 'Bestseller'] } } },
            {
                $lookup: {
                    from: 'rates',
                    localField: '_id',
                    foreignField: 'course',
                    pipeline: [
                        {
                            $group: {
                                _id: '$course',
                                rate: { $avg: '$rate' },
                                numOfRate: { $count: {} }
                            }
                        }
                    ],
                    as: 'rating'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $lookup: {
                    from: 'categorys',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$author' },
            { $unwind: '$category' },
            {
                $sort: { sellNumber: -1, rating: -1 }
            },
            { $count: "total" }
        )
        aQuery.push(
            { $match: { publish: true, type: { $in: ["Hot", 'Bestseller'] } } },
            {
                $lookup: {
                    from: 'rates',
                    localField: '_id',
                    foreignField: 'course',
                    pipeline: [
                        {
                            $group: {
                                _id: '$course',
                                rate: { $avg: '$rate' },
                                numOfRate: { $count: {} }
                            }
                        }
                    ],
                    as: 'rating'
                }
            },
            {
                $unwind: {
                    "path": "$rating",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            {
                $lookup: {
                    from: 'categorys',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$author' },
            { $unwind: '$category' },
            {
                $sort: { sellNumber: -1, rating: -1 }
            },

        )
        if (page && limit) {
            aQuery.push(
                {
                    $skip: (parseInt(page) - 1) * parseInt(limit)
                },
                {
                    $limit: parseInt(limit)
                },
            )
        }
        // nếu user đã login => loại những khoá học đã mua
        if (user) {
            let khoaHocDaMuas = await MyCourseModel.find({ user }).lean()
            let exceptIds = khoaHocDaMuas.map(item => item.course)
            aQuery.unshift({ $match: { _id: { $nin: exceptIds } } })
        }
        const courses = await CourseModel.aggregate(aQuery)
        const count = (await CourseModel.aggregate(countQuery))[0]?.total || 0
        return res.status(200).json({ message: "ok", total: count, courses })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}


// fn: lấy thông tin đánh giá khoá học và đánh giá của user nếu có
const getRates = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const { slug } = req.params
        const { user } = req
        // lấy id khoá học
        const course = await CourseModel.findOne({ slug }).lean()
        if (!course) return res.status(404).json({ message: "Course not found" })
        // lấy thông tin đánh giá khoá học
        const rates = await RateModel.find({ course: course._id })
            .select('-__v -course')
            .populate('author', '_id fullName')
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
        var userRating = null
        if (user) {
            userRating = await RateModel.findOne({ user, course }).lean()
        }
        return res.status(200).json({ message: 'ok', userRating, rates })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}


//fn: xoá khoá học
const deleteCourse = async (req, res, next) => {
    try {
        const { slug } = req.params
        const { account, user } = req

        // kiểm tra khoá học có tồn tại không?
        const course = await CourseModel.findOne({ slug }).lean()
        if (!course) {
            return res.status(400).json({ message: "Mã khoá học không hợp lệ" })
        }
        if (account.role !== 'admin') {
            if (JSON.stringify(user._id) !== JSON.stringify(course.author)) {
                return res.status(400).json({ message: "Not permitted" })
            }
        }

        // kiểm tra khoá học có người mua chưa ?
        const isBuyed = await MyCourseModel.findOne({ course: course._id }).lean()
        if (isBuyed) {
            return res.status(400).json({ message: "Khoá học đã có người mua. Không thể xoá" })
        }

        // xoá khoá học
        await CourseModel.deleteOne({ slug: slug })
        res.status(200).json({ message: "delete ok" })

        let chapters = await ChapterModel.find({ course: course._id }).select("_id").lean()
        chapters = chapters.map(obj => obj._id)
        // xoá chapters và lesson của từng chapter
        await LessonModel.deleteMany({ chapter: { $in: chapters } })
        await ChapterModel.deleteMany({ course: course._id })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "error", error: error.message })
    }
}


//fn: xem khoá học để kiểm duyệt (có cả nội dung bài giảng)
const getDetailPendingCourse = async (req, res, next) => {
    try {
        const { slug } = req.params

        const course = await CourseModel.aggregate([
            {
                $match: { slug: slug }
            },
            {   // tính rate trung bình
                $lookup: {
                    from: 'rates',
                    localField: '_id',
                    foreignField: 'course',
                    pipeline: [
                        {
                            $group: {
                                _id: '$course',
                                rate: { $avg: '$rate' },
                                numOfRate: { $count: {} },
                                star5: { $sum: { $cond: [{ $eq: ['$rate', 5] }, 1, 0] } },
                                star4: { $sum: { $cond: [{ $eq: ['$rate', 4] }, 1, 0] } },
                                star3: { $sum: { $cond: [{ $eq: ['$rate', 3] }, 1, 0] } },
                                star2: { $sum: { $cond: [{ $eq: ['$rate', 2] }, 1, 0] } },
                                star1: { $sum: { $cond: [{ $eq: ['$rate', 1] }, 1, 0] } },
                            },
                        }
                    ],
                    as: 'rating'
                }
            },
            { // unwind rating
                $unwind: {
                    "path": "$rating",
                    "preserveNullAndEmptyArrays": true
                }
            },
            { // lookup user
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { // unwind author
                $unwind: "$author"
            },
            { // lookup categorys
                $lookup: {
                    from: 'categorys',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { // unwind category
                $unwind: "$category"
            },
            { // lookup chapters
                $lookup: {
                    from: 'chapters',
                    localField: '_id',
                    foreignField: 'course',
                    as: 'chapters'
                }
            },
            {
                $unwind: {
                    path: "$chapters",
                    preserveNullAndEmptyArrays: true
                }
            },
            { // lookup lessons
                $lookup: {
                    from: 'lessons',
                    localField: 'chapters._id',
                    foreignField: 'chapter',
                    as: 'chapters.lessons'
                }
            },
            { // group
                $group: {
                    _id: "$_id",
                    name: { $first: "$name" },
                    slug: { $first: "$slug" },
                    category: { $first: "$category" },
                    thumbnail: { $first: "$thumbnail" },
                    description: { $first: "$description" },
                    lang: { $first: "$lang" },
                    intendedLearners: { $first: "$intendedLearners" },
                    requirements: { $first: "$requirements" },
                    targets: { $first: "$targets" },
                    level: { $first: "$level" },
                    currentPrice: { $first: "$currentPrice" },
                    originalPrice: { $first: "$originalPrice" },
                    saleOff: { $first: "$saleOff" },
                    rating: { $first: "$rating" },
                    author: { $first: "$author" },
                    hashtags: { $first: "$hashtags" },
                    publish: { $first: "$publish" },
                    status: { $first: "$status" },
                    chapters: { $push: "$chapters" },
                }
            },
            {
                $project: {
                    'slug': 1,
                    'name': 1,
                    'category._id': 1,
                    'category.name': 1,
                    'category.slug': 1,
                    'thumbnail': 1,
                    'description': 1,
                    'lang': 1,
                    'intendedLearners': 1,
                    'requirements': 1,
                    'targets': 1,
                    'level': 1,
                    'currentPrice': 1,
                    'originalPrice': 1,
                    'saleOff': 1,
                    'sellNumber': 1,
                    'rating.rate': 1,
                    'rating.numOfRate': 1,
                    'rating.star5': 1,
                    'rating.star4': 1,
                    'rating.star3': 1,
                    'rating.star2': 1,
                    'rating.star1': 1,
                    'author._id': 1,
                    'author.fullName': 1,
                    'hashtags': 1,
                    'publish': 1,
                    'status': 1,
                    'chapters': 1,
                }
            }
        ])
        if (course[0]) {
            if (!course[0].chapters[0].name) { course[0].chapters = [] }
            return res.status(200).json({ message: 'ok', course: course[0] })
        }

        res.status(404).json({ message: 'không tìm thấy' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}
//#endregion


// #region lesson

const getLessons = async (req, res, next) => {

}
const postLesson = async (req, res, next) => {
    try {

    } catch (error) {

    }
}
const putLesson = async (req, res, next) => {

}
const deleteLesson = async (req, res, next) => {

}


// #endregion



module.exports = {
    postCourse,
    getCourses,
    putCourse,
    getCourse,
    getRelatedCourses,
    getHotCourses,
    getRates,
    getSuggestCourses,
    deleteCourse,
    getDetailPendingCourse,
    setData
}