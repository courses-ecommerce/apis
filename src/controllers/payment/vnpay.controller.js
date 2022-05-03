const { VNPay } = require('vn-payments');

// config merchant vnpay
const vnpay = new VNPay({
    paymentGateway: process.env.PAYMENT_GATEWAY,
    merchant: process.env.MERCHANT_CODE,
    secureSecret: process.env.SECURE_SECRET,
});


const checkoutVNPay = async (req, res, next) => {
    try {
        const checkoutData = res.locals.checkoutData;
        checkoutData.returnUrl = `http://${req.headers.host}/payment/vnpay/callback`

        // checkout thông tin và redirect tới payment gate
        return vnpay.buildCheckoutUrl(checkoutData)
            .then(checkoutUrl => {
                res.locals.checkoutUrl = checkoutUrl
                return checkoutUrl;
            })
    } catch (error) {
        console.log(error);
        next(error)
    }
}


const callbackVNPay = async (req, res, next) => {
    // thông tin trả về sau khi thanh toán
    const query = req.query;
    console.log(query);
    // kiểm tra thông tin trả về
    var results = await vnpay.verifyReturnUrl(query);
    if (results) {
        if (results.vnp_ResponseCode === '00') {
            // thanh toán thành công
            results.message = " thanh toán thành công"
            results.isSuccess = true
        }
        return results
    } else {
        return undefined
    }
}


module.exports = {
    checkoutVNPay,
    callbackVNPay,
}