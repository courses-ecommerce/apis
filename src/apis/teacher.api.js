var express = require('express');
var teacherApis = express.Router();
const teacherController = require('../controllers/teacher.controller');
const passport = require('../middlewares/passport.middleware');
const accessControl = require('../middlewares/access_control.middleware')


// api: lấy thông tin khoá học đã tạo
teacherApis.get('/', passport.jwtAuthentication, teacherController.getMyCourses)


module.exports = teacherApis