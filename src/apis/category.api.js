var express = require('express');
var categoryApis = express.Router();
const categoryController = require('../controllers/category.controller');
const passport = require('../middlewares/passport.middleware');

categoryApis.post('/', categoryController.postCategory)

categoryApis.get('/', categoryController.getCategories)

categoryApis.put('/:slug', passport.jwtAuthentication, categoryController.putCategory)

categoryApis.delete('/:slug', passport.jwtAuthentication, categoryController.deleteCategory)


module.exports = categoryApis