var express = require('express');
var categoryApis = express.Router();
const categoryController = require('../controllers/category.controller');
const passport = require('../middlewares/passport.middleware');

categoryApis.post('/', passport.jwtAuthentication, categoryController.postCategory)

categoryApis.get('/', categoryController.getCategories)

categoryApis.get('/:slug', categoryController.getCategory)

categoryApis.put('/:slug', passport.jwtAuthentication, passport.isAdmin, categoryController.putCategory)

categoryApis.delete('/:slug', passport.jwtAuthentication, passport.isAdmin, categoryController.deleteCategory)

categoryApis.delete('/', passport.jwtAuthentication, passport.isAdmin, categoryController.deleteManyCategory)


module.exports = categoryApis