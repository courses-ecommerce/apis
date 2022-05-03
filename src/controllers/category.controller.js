
const CategoryModel = require('../models/courses/category.model');


// fn: tạo category
const postCategory = async (req, res, next) => {
    try {
        const { name } = req.body
        await CategoryModel.create({ name })
        return res.status(201).json({ message: 'ok' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error' })
    }
}

// fn: lấy category
const getCategories = async (req, res, next) => {
    try {
        const { name } = req.query
        let aCountQuery = []
        let aQuery = []
        if (name) {
            aQuery.push(
                { $match: { $text: { $search: name } } },
                { $sort: { score: { '$meta': 'textScore' } } },
            )
            aCountQuery.push(
                { $match: { $text: { $search: name } } },
                { $sort: { score: { '$meta': 'textScore' } } },
            )
        } else {
            aQuery.push({ $match: {} })
            aCountQuery.push({ $match: {} })
        }
        aCountQuery.push({ $count: "total" })

        const total = await CategoryModel.aggregate(aCountQuery)

        const categories = await CategoryModel.aggregate(aQuery)
        return res.status(200).json({ message: 'ok', totalCount: total, categories })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error' })
    }
}


// fn: cập nhật category
const putCategory = async (req, res, next) => {
    try {
        const { slug } = req.params
        const newCategory = req.body
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
        await CategoryModel.deleteOne({ slug: slug })
        return res.status(200).json({ message: 'ok' })
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
}