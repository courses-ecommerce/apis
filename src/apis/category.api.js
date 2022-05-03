var express = require('express');
var categoryApis = express.Router();
const categoryController = require('../controllers/category.controller');


categoryApis.post('/', categoryController.postCategory)

categoryApis.get('/', categoryController.getCategories)

categoryApis.put('/:id', categoryController.putCategory)

categoryApis.delete('/:id', categoryController.deleteCategory)


module.exports = categoryApis