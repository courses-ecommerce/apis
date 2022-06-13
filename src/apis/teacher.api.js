var express = require('express');
var teacherApis = express.Router();
const teacherController = require('../controllers/teacher.controller');
const passport = require('../middlewares/passport.middleware');
const accessControl = require('../middlewares/access_control.middleware')


// api: lấy thông tin khoá học đã tạo
teacherApis.get('/courses', passport.jwtAuthentication, teacherController.getMyCourses)

// api: lấy thông tin teacher
teacherApis.get('/info', passport.jwtAuthentication, teacherController.getMyCourses)

// api: cập nhật thông tin teacher
teacherApis.put('/info', passport.jwtAuthentication, teacherController.putMyInfo)

// api: lấy thông tin doanh thu
teacherApis.get('/my-revenue', passport.jwtAuthentication, teacherController.getMyRevenue)



module.exports = teacherApis