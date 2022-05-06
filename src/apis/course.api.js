var express = require('express');
var courseApis = express.Router();
const courseController = require('../controllers/course.controller');
const { dontStorageUpload } = require('../configs/storage.config');
const passport = require('../middlewares/passport.middleware');
const accessControl = require('../middlewares/access_control.middleware')

// api tạo mới khoá học 
courseApis.post('/', passport.jwtAuthentication, passport.authPage(['teacher', 'admin']), dontStorageUpload.single('thumbnail'), courseController.postCourse)

// api lấy danh sách khoá học
courseApis.get('/', passport.jwtAuthenticationOrNull, courseController.getCourses)

// api lấy danh sách khoá học hot
courseApis.get('/hot', passport.jwtAuthentication, courseController.getHotCourses)

// api lấy danh sách khoá học đề xuất
courseApis.get('/suggest', passport.jwtAuthentication, passport.jwtAuthenticationOrNull, courseController.getSuggestCourses)

// api xem chi tiết khoá học theo slug
courseApis.get('/:slug', courseController.getCourse)

// api lấy danh sách khoá học liên quan theo category
courseApis.get('/:slug/related', courseController.getRelatedCourses)

// api cập nhật khoá học theo slug
courseApis.put('/:slug', passport.jwtAuthentication, accessControl.grantAccess('updateOwn', 'course'), courseController.putCourse)

// api lấy thông tin đánh giá của khoá học
courseApis.get('/:slug/rate', courseController.getRates)


module.exports = courseApis