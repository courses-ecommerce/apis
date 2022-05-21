const express = require('express');
const adminUserApis = express.Router()
const adminUserController = require('../controllers/adminUser.controller');
const passport = require('../middlewares/passport.middleware');

// api: lấy danh sách tài khoản use
adminUserApis.get('/', passport.jwtAuthentication, passport.isAdmin, adminUserController.getAccountAndUsers)

// api: lấy chi tiết 1 tài khoản bằng id
adminUserApis.get('/:id', passport.jwtAuthentication, passport.isAdmin, adminUserController.getDetailAccountAndUser)

// api: tạo một tài khoản và người dùng
adminUserApis.post('/', passport.jwtAuthentication, passport.isAdmin, adminUserController.postAccountAndUser)

// api: cập nhật tài khoản người dùng
adminUserApis.put('/:id', passport.jwtAuthentication, passport.isAdmin, adminUserController.putAccountAndUser)

// api: xoá tài khoản người dùng
adminUserApis.delete('/:id', passport.jwtAuthentication, passport.isAdmin, adminUserController.deleteAccountAndUser)


module.exports = adminUserApis