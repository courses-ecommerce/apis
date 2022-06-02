var express = require('express');
var statisticApis = express.Router();
const statisticController = require('../controllers/statistic.controller');
const passport = require('../middlewares/passport.middleware');
const accessControl = require('../middlewares/access_control.middleware')


// api: lấy thông doanh thu theo tháng 
statisticApis.get('/revenues/monthly/:year', passport.jwtAuthentication, passport.isAdmin, statisticController.getMonthlyRevenue)

// api: lấy thông tin doanh thu theo năm
statisticApis.get('/revenues/yearly', passport.jwtAuthentication, passport.isAdmin, statisticController.getYearlyRevenue)

// api: thống kê số lượng người dùng đang hoạt động
statisticApis.get('/users', statisticController.getCountUsers)

// api: thống kê số lượng khoá học 
statisticApis.get('/courses', statisticController.getCountCourses)

// api: thống kê số lượng mã giảm giá
statisticApis.get('/coupons', statisticController.getCountCoupons)

module.exports = statisticApis