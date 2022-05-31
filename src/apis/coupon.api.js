var express = require('express');
var couponApis = express.Router();
const couponController = require('../controllers/coupon.controller')
const passport = require('../middlewares/passport.middleware');

// api: danh sách mã và phân trang
couponApis.get('/', passport.jwtAuthentication, passport.isAdmin, couponController.getCoupons)

// api: chi tiết mã
couponApis.get('/:id', passport.jwtAuthentication, passport.isAdmin, couponController.getCoupon)

// api: thêm mã
couponApis.post('/', passport.jwtAuthentication, couponController.postCoupon)

// api: cập nhật mã
couponApis.put('/:id', passport.jwtAuthentication, couponController.updateCoupon)

// api: xoá mã
couponApis.delete('/:id', passport.jwtAuthentication, couponController.deleteCoupon)

couponApis.delete('/', passport.jwtAuthentication, couponController.deleteManyCoupon)

module.exports = couponApis;
