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




//#region  courses

/** fn: Thêm khoá học
 * @param {category} req is array id of topic
 * @param {name, description, introduction } req is string type
 * @param {currentPrice, originalPrice } req is number type
 * @param {image } req is image type
 */

const postCourse = async (req, res, next) => {
    try {
        const author = req.user
        const image = req.file
        const { name, category, description, lang, intendedLearners, requirements, targets, level, currentPrice, originalPrice, hashtags = [] } = req.body
        // // tags is array
        // if (Array.isArray(tags) != true || Array.isArray(categories) != true) {
        //     return res.status(403).json({ message: "some attribute of course is array" })
        // }
        // tính giảm giá
        let saleOff = (1 - parseInt(currentPrice) / parseInt(originalPrice)) * 100 || 0
        // upload image lên cloud
        let thumbnail = await helper.uploadImageToCloudinary(image, name)
        // tạo khoá học
        await CourseModel.create(
            { name, category, description, currentPrice, originalPrice, saleOff, author, thumbnail, lang, intendedLearners, requirements, targets, level, hashtags }
        )
        return res.status(201).json({ message: "ok" })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "error 1" })
    }
}

// fn: Cập nhật khoá học: (thêm markdown cho description)
/**
 * @param { id } req  is object id
 * @param newCourse req is object 
 */
// Note: không cho phép cập nhật sellNumber, teacher không được phép cập nhật publish
const putCourse = async (req, res, next) => {
    try {
        const user = req.user
        const account = req.account
        const { slug } = req.params
        var newCourse = req.body
        // tránh hacker
        if (newCourse.sellNumber) {
            delete newCourse.sellNumber
        }
        if (newCourse.publish) {
            if (account.role == "admin") {
                newCourse.publish = JSON.stringify(newCourse.publish) == "true"
            } else {
                delete newCourse.publish
            }
        }
        // lấy thông tin hiện tại
        const course = await CourseModel.findOne({ slug }).lean()
        if (!course) return res.status(404).json({ message: "Course not found!" })
        // check permit 
        if (account.role !== "admin" && JSON.stringify(user._id) !== JSON.stringify(course.author)) {
            return res.status(401).json({ message: "not permited" })
        }
        // chỉ cho phép admin pulish
        if (newCourse.publish && account.role !== "admin") {
            delete newCourse.publish
        }
        if (newCourse.currentPrice || newCourse.originalPrice) {
            let cp = newCourse.currentPrice || course.currentPrice
            let op = newCourse.originalPrice || course.originalPrice
            newCourse.saleOff = (1 - parseInt(cp) / parseInt(op)) * 100
        }

        // cập nhật theo slug
        await CourseModel.updateOne({ slug }, newCourse)
        return res.status(200).json({ message: 'ok' })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "error" })
    }
}


// fn: Lấy tất cả khoá học và phân trang
// ex: ?sort=score&name=api&category=web-development&price=10-50&hashtags=nodejs-mongodb&rating=4.5
const getCourses = async (req, res, next) => {
    try {
        var { page = 1, limit = 10, sort, name, category, price, hashtags, rating, level, publish = 'true' } = req.query
        const nSkip = (parseInt(page) - 1) * parseInt(limit)
        let searchKey = await didYouMean(name) || null
        let aCountQuery = [
            { $match: { publish: publish == 'true' } },
            {
                $lookup: {
                    from: 'categorys',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
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
                $unwind: "$category"
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
                    'rating.rate': 1,
                    'rating.numOfRate': 1,
                    //'score': { $meta: "textScore" },
                }
            },
            { $skip: nSkip },
            { $limit: parseInt(limit) }
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
        // tìm theo category slug
        if (category) {
            aQuery.push(
                { $match: { 'category.slug': category } }
            )
            aCountQuery.push(
                { $match: { 'category.slug': category } }
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
        if (price) {
            let [min, max] = price.split('-')
            min = parseInt(min)
            max = parseInt(max)
            aQuery.push(
                { $match: { $and: [{ currentPrice: { $gt: min } }, { currentPrice: { $lt: max } }] } }
            )
            aCountQuery.push(
                { $match: { $and: [{ currentPrice: { $gt: min } }, { currentPrice: { $lt: max } }] } }
            )
        }
        // sắp xếp và thống kê
        if (sort) {
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

        aCountQuery.push({ $count: "total" })
        const courses = await CourseModel.aggregate(aQuery)
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

        // lấy thông tin khoá học
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
                }
            },
        ])
        res.status(200).json({ message: 'ok', course })
        // lưu lịch sử xem
        if (user) {
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
        return res.status(500).json({ message: "error" })
    }
}

// fn: Xem danh sách khoá học liên quan theo slug (category, hashtags, rating)
const getRelatedCourses = async (req, res, next) => {
    try {
        const { slug } = req.params
        const { page = 1, limit = 12 } = req.query
        // course
        const course = await CourseModel.findOne({ slug }).lean()
        // tìm khoá học liên quan theo hasgtag
        const courses = await CourseModel.aggregate([
            {
                $match: {
                    $and: [
                        { hashtags: { $in: course.hashtags } },
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
                $sort: { rating: -1 }
            },
            {
                $limit: parseInt(limit)
            },
            {
                $skip: (parseInt(page) - 1) * parseInt(limit)
            }
        ])
        const totalCount = await CourseModel.aggregate([
            {
                $match: {
                    $and: [
                        { hashtags: { $in: course.hashtags } },
                        { _id: { $ne: ObjectId(course._id) } },
                        { publish: true },
                    ]
                }
            }, {
                $count: 'total'
            }
        ])

        return res.status(200).json({ message: 'ok', totalCount: totalCount[0] || 0, courses })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error' })
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
        var courses = null
        var keyword = ''
        if (user) {
            // nếu có user
            // lấy first recent search
            const historySearchOfUser = await HistorySearchModel.findOne({ user: user._id }).lean()
            keyword = historySearchOfUser ? historySearchOfUser.historySearchs[0] : null
            if (keyword) {
                searchKey = await didYouMean(keyword)
                if (searchKey.suggestion) {
                    searchKey.original = keyword
                    keyword = searchKey.suggestion
                }
                // tìm khoá học liên quan lịch sử tìm kiếm
                courses = await CourseModel.find({ $text: { $search: keyword }, publish: true }).populate('author', 'fullName').populate('category', 'name slug')
                    .limit(parseInt(limit))
            } else {
                courses = []
            }
        } else {
            courses = []
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
        const { limit = 12, category } = req.query
        let aQuery = []
        if (category) {
            aQuery.unshift({
                $match: { "category.slug": category }

            })
        }
        aQuery.push(
            { $match: { publish: true, } },
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
            {
                $sort: { sellNumber: -1, rating: -1 }
            },
            {
                $limit: parseInt(limit)
            })

        const courses = await CourseModel.aggregate(aQuery)
        return res.status(200).json({ message: "ok", courses })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error' })
    }
}


// fn: lấy thông tin đánh giá khoá học
const getRates = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query
        const { slug } = req.params
        // lấy id khoá học
        const course = await CourseModel.findOne({ slug })
        if (!course) return res.status(404).json({ message: "Course not found" })
        // lấy thông tin đánh giá khoá học
        const rates = await RateModel.find({ course: course._id })
            .select('-__v -course')
            .populate('author', '_id fullName')
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
        return res.status(200).json({ message: 'ok', rates })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error' })
    }
}

//#endregion

// #region chapter 

const postChapter = async (req, res, next) => {
    try {
        const { courses, name } = req.body
        await ChapterModel.create({ courses, name })
        res.status(201).json({ message: "ok" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

/**
 * 
 * @param {boolean} lesson lấy giá trị của lesson trong chapter 
 * @param {string} course id khoá học
 */
const getChapters = async (req, res, next) => {
    try {
        const { lesson = true, course } = req.query
        let query = []
        if (course) {
            query.unshift({
                $match: { _id: ObjectId(course) }
            })
        }
        if (lesson) {
            query.push({
                $lookup: {
                    from: "lessons",
                    localField: "_id",
                    foreignField: "chapter",
                    as: "lessons"
                }
            })
        }
        const chapters = await ChapterModel.aggregate(query)
        res.status(200).json({ message: "ok", chapters })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}
const putChapter = async (req, res, next) => {
    try {
        const { id } = req.params
        const { name, number } = req.body
        await ChapterModel.updateOne({ _id: id }, { name, number })
        res.status(200).json({ message: " update ok" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}
const deleteChapter = async (req, res, next) => {
    try {
        const { id, name } = req.body
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

// #endregion 


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

    // chapter
    postChapter,
    getChapters,
    putChapter,
    deleteChapter,
    // lesson
    getLessons,
    postLesson,
    putLesson,
    deleteLesson,
}