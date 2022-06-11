
const CategoryModel = require('../models/courses/category.model');
const CourseModel = require('../models/courses/course.model')
var fs = require('fs');

// fn: tạo category
const postCategory = async (req, res, next) => {
    try {
        const { name } = req.body
        const { account } = req
        if (account.role == 'admin') {
            req.body.publish = true
        }
        await CategoryModel.create(req.body)
        return res.status(201).json({ message: 'ok' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error' })
    }
}

// fn: lấy category
const getCategories = async (req, res, next) => {
    try {
        const { name, publish = 'true', limit, page, isPending } = req.query
        let aCountQuery = []
        let aQuery = [
            {
                $lookup: {
                    from: 'courses',
                    localField: "_id",
                    foreignField: 'category',
                    as: "used"
                }
            }
        ]
        if (name) {
            aQuery.push(
                { $match: { $text: { $search: name }, publish: publish == 'true' } },
                { $sort: { score: { '$meta': 'textScore' } } },
            )
            aCountQuery.push(
                { $match: { $text: { $search: name }, publish: publish == 'true' } },
                { $sort: { score: { '$meta': 'textScore' } } },
            )
        } else {
            aQuery.push({ $match: { publish: publish == 'true' } })
            aCountQuery.push({ $match: { publish: publish == 'true' } })
        }

        if (page && limit) {
            let nskip = (parseInt(page) - 1) * parseInt(limit)
            aQuery.push({ $skip: nskip }, { $limit: parseInt(limit) })
        }
        if (isPending) {
            aQuery.push({ $match: { isPending: isPending == 'true' } })
            aCountQuery.push({ $match: { isPending: isPending == 'true' } })
        }
        aQuery.push(
            {
                $project: {
                    name: 1,
                    slug: 1,
                    publish: 1,
                    status: 1,
                    used: {
                        $cond: {
                            if: {
                                $eq: [{ $size: "$used" }, 0]
                            },
                            then: false,
                            else: true
                        }
                    }
                }
            })
        aCountQuery.push({ $count: "total" })

        const totalCount = await CategoryModel.aggregate(aCountQuery)
        const total = totalCount[0]?.total || 0

        const categories = await CategoryModel.aggregate(aQuery)
        return res.status(200).json({ message: 'ok', total, categories })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error' })
    }
}
// fn: lấy category
const getCategory = async (req, res, next) => {
    try {
        const { slug } = req.params

        const category = await CategoryModel.findOne({ slug })
        return res.status(200).json({ message: 'ok', category })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error' })
    }
}


// fn: cập nhật category
const putCategory = async (req, res, next) => {
    try {
        const { slug } = req.params

        var newCategory = req.body

        await CategoryModel.updateOne({ slug: slug }, newCategory)
        return res.status(200).json({ message: 'ok' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error' })
    }
}

// fn: xoá category
const deleteCategory = async (req, res, next) => {
    try {
        const { slug } = req.params
        const { account, user } = req
        if (account.role !== 'admin') {
            return res.status(401).json({ message: 'Not permitted' })
        }
        const category = await CategoryModel.findOne({ slug })
        const course = await CourseModel.findOne({ category })
        if (course) {
            return res.status(400).json({ message: 'không được xoá' })
        }
        await CategoryModel.deleteOne({ slug: slug })
        return res.status(200).json({ message: 'ok' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error' })
    }
}

// fn: xoá category
const deleteManyCategory = async (req, res, next) => {
    try {
        const { slugs } = req.body
        const { account, user } = req
        let logs = ''
        if (account.role !== 'admin') {
            return res.status(401).json({ message: 'Not permitted' })
        }

        for (let i = 0; i < slugs.length; i++) {
            const slug = slugs[i];
            const category = await CategoryModel.findOne({ slug })
            if (category) {
                console.log('có cate', category.name);
                const course = await CourseModel.findOne({ category })
                if (course) {
                    console.log('cos coursee', course.name);
                    logs += `category ${slug} không thể xoá \n`
                } else {
                    await CategoryModel.deleteOne({ slug })
                }
            }
        }

        if (logs != '') {
            let file = Date.now()
            fs.appendFileSync(`./src/public/logs/${file}.txt`, logs);
            return res.status(400).json({ message: "có lỗi", urlLogs: `/logs/${file}.txt` })
        }

        return res.status(200).json({ message: 'delete ok' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error' })
    }
}


module.exports = {
    postCategory,
    getCategories,
    getCategory,
    putCategory,
    deleteCategory,
    deleteManyCategory,
}