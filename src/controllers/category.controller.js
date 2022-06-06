
const CategoryModel = require('../models/courses/category.model');


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
        const { name, publish = 'true' } = req.query
        let aCountQuery = []
        let aQuery = []
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


// fn: cập nhật category
const putCategory = async (req, res, next) => {
    try {
        const { slug } = req.params

        var newCategory = req.body
        if (newCategory.publish) {
            newCategory.publish = JSON.stringify(newCategory.publish) == "true"
        }
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
        if (account.role !== 'admin') {
            return res.status(401).json({ message: 'Not permitted' })
        }
        await CategoryModel.deleteMany({ slug: { $in: slugs } })
        return res.status(200).json({ message: 'delete ok' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error' })
    }
}


module.exports = {
    postCategory,
    getCategories,
    putCategory,
    deleteCategory,
    deleteManyCategory,
}