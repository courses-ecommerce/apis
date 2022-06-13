var express = require('express');
var statisticApis = express.Router();
const statisticController = require('../controllers/statistic.controller');
const passport = require('../middlewares/passport.middleware');
const accessControl = require('../middlewares/access_control.middleware')


// api: top giáo viên có số lượng bán/doanh thu cao nhất trong năm
statisticApis.get('/top-teachers-of-year', statisticController.getTopYearTeachers)

// api: top giáo viên có số lượng bán/doanh thu cao nhất các tháng trong năm
statisticApis.get('/top-teachers-of-months', statisticController.getTopMonthlyTeachers)

// api: lấy doanh thu từ ngày a đến b tính theo ngày hoặc tháng
statisticApis.get('/revenues/daily', passport.jwtAuthentication, passport.isAdmin, statisticController.getDailyRevenue)

// api: lấy thông doanh thu theo tháng 
statisticApis.get('/revenues/monthly/:year', passport.jwtAuthentication, passport.isAdmin, statisticController.getMonthlyRevenue)

// api: lấy thông tin doanh thu theo năm
statisticApis.get('/revenues/yearly', passport.jwtAuthentication, passport.isAdmin, statisticController.getYearlyRevenue)

// api: thống kê số lượng người dùng theo các năm
statisticApis.get('/users/yearly', passport.jwtAuthentication, passport.isAdmin, statisticController.getCountUsersByYear)

// api: thống kê số lượng người dùng theo các tháng trong năm
statisticApis.get('/users/monthly', passport.jwtAuthentication, passport.isAdmin, statisticController.getCountUsersByMonth)

// api: thống kê số lượng khoá học 
statisticApis.get('/courses', passport.jwtAuthentication, passport.isAdmin, statisticController.getCountCourses)

// api: thống kê số lượng bán khoá học ở năm x
statisticApis.get('/top-sale-courses', passport.jwtAuthentication, passport.isAdmin, statisticController.getTopSaleCourses)

// api: thống kê số lượng mã giảm giá
statisticApis.get('/coupons', passport.jwtAuthentication, passport.isAdmin, statisticController.getCountCoupons)

// api: thống kê doanh thu của các giảng viên theo tháng
statisticApis.get('/revenues/teachers', statisticController.getTeachersRevenueByMonth)

// api: thống kê lương chi tiết của giáo viên
statisticApis.get('/revenues/teachers/:id', statisticController.getDetailTeachersRevenue)


module.exports = statisticApis