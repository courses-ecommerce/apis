var express = require('express');
var paymentApis = express.Router();
const paymentController = require('../controllers/payment/index.controller')
const passport = require('../middlewares/passport.middleware');

// api: checkout thông tin giá khoá học ước tính
paymentApis.post('/checkout-cart', passport.jwtAuthentication, paymentController.getCheckoutCart)

// api: checkout thông tin trước thanh toán
paymentApis.post('/checkout', paymentController.postPaymentCheckout)
// paymentApis.post('/checkout', passport.jwtAuthentication, paymentController.postPaymentCheckout)


// api: thông tin sau khi thanh toán
paymentApis.get('/:gateway/callback', paymentController.getPaymentCallback)

module.exports = paymentApis;
