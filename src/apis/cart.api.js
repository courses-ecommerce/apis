var express = require('express');
var cartApis = express.Router();
const cartController = require('../controllers/cart.controller');
const passport = require('../middlewares/passport.middleware');
const accessControl = require('../middlewares/access_control.middleware')


// api: đánh giá của khoá học
cartApis.get('/', passport.jwtAuthentication, cartController.getCart)

cartApis.post('/', passport.jwtAuthentication, cartController.postCart)

cartApis.put('/:course', passport.jwtAuthentication, cartController.putCart)

cartApis.delete('/:course', passport.jwtAuthentication, cartController.deleteCart)


module.exports = cartApis