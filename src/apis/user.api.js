var express = require('express');
var userApis = express.Router();
const userController = require('../controllers/user.controller');
const passport = require('../middlewares/passport.middleware');
const accessControl = require('../middlewares/access_control.middleware')


// api: lấy thông tin người dùng hiện tại
userApis.get('/', passport.jwtAuthentication, userController.getUser)

// api: cập nhật thông tin người dùng hiện tại
userApis.put('/', passport.jwtAuthentication, userController.putUser)

// api: kích hoạt teacher role
userApis.post('/', passport.jwtAuthentication, userController.postActiveTeacherRole)

module.exports = userApis