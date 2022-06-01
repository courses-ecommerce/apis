const { checkoutVNPay, callbackVNPay } = require('../payment/vnpay.controller')
const InvoiceModel = require('../../models/invoice.model')
const DetailInvoiceModel = require('../../models/detailInvoice.model');
const CouponModel = require('../../models/coupon.model');
var uniqid = require('uniqid');
const CourseModel = require('../../models/courses/course.model');
const MyCourseModel = require('../../models/users/myCourse.model');
const CartModel = require('../../models/users/cart.model');

/** Tạo hoá đơn cho người dùng (chưa thanh toán)
 * @param {Object} data
 * @property {String} data.user id người dùng
 * @property {String} data.orderId id đơn hàng
 * @property { [Object] } data.courses mảng thông tin khoá học (thông tin khoá học và mã giảm giá cho từng khoá) 
 * @property {Number} data.totalPrice giá tiền cần thanh toán để mua các khoá học ở data.courses
 * @returns {Boolean}
 * @property data.courses data.totalPrice là được xử lý từ hàm handlerCheckoutCart
 * @example data = {
    "user":"userid"
    "orderId":"54as4d6asd65as4d3",
    "totalPrice": 50,
    "courses": [
        {
            "_id": "625306b0427f22199612e141",
            "name": "API Restful Javascript com Node.js, Typescript, TypeORM, v.v.",
            "thumbnail": "uri/test.jpg",
            "currentPrice": 30,
            "originalPrice": 0,
            "saleOff": 0,
            "author": "625060fe1d697fe08f940a5e",
            "slug": "api-restful-javascript-com-node-js-typescript-typeorm-v-v",
            "amount": 20,
            "coupon": {
                "message": "Áp dụng thành công",
                "discountAmount": 10,
                "code": "TESTCODE",
                "title": "test",
                "type": "money",
                "amount": 10
            }
        }
    ]
}
 */

const handlerCreateInvoice = async (data, user) => {
    try {
        // tạo hoá đơn tổng
        const invoice = await InvoiceModel.create({
            _id: data.orderId,
            transactionId: "hahaha",
            user: user,
            totalPrice: data.totalPrice,
        })
        // tạo chi tiết hoá đơn
        for (let i = 0; i < data.courses.length; i++) {
            const course = data.courses[i];
            await DetailInvoiceModel.create({
                invoice: invoice._id,
                courseId: course._id,
                courseSlug: course.slug,
                courseName: course.name,
                courseCurrentPrice: course.currentPrice,
                courseAuthor: course.author,
                couponCode: course.coupon.code || "",
                amount: course.amount,
            })
        }
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}



/** xử lý giỏ hàng => thông tin các giá (sau giảm giá) khoá học và tổng tiền cần thanh toán
 *  @param {Array} carts 
 */
const handlerCheckoutCart = async (carts) => {
    try {

    } catch (error) {
        throw error
    }
}



// fn: lấy thông tin khoá học để checkout thanh toán khoá học
/** postCheckoutCart
 * @param {Object} req.body
 * @param {Array} res.body.courses ex: [{ slug: 'slug1', coupon: 'magiamgia1' }, { slug: 'slug2' }, { slug: 'slug3', coupon: 'magiamgia3'}]
 */
const getCheckoutCart = async (req, res, next) => {
    try {
        const user = req.user
        // xử lý giỏ hàng
        const carts = await CartModel.find({ user }).lean()

        return res.status(200).json({ message: "ok", totalPrice: result.totalPrice, data: result.courses })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message })
    }
}


/** 
* @param {Object} req.body form-data
* @property { array } req.body.courses mảng slug khoá học. ex: courses = ['slug1', 'slug2' ] 
*/

const postPaymentCheckout = async (req, res, next) => {
    const { user } = req
    const params = Object.assign({}, req.body);

    const clientIp =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);



    // xử lý thông tin đơn hàng => tạo hoá đơn thanh toán

    let orderId = uniqid()
    //for test
    let courses = [
        {
            slug: "api-restful-javascript-com-node-js-typescript-typeorm-v-v",
            coupon: "TESTCODE"
        },
        {
            slug: "react-the-complete-guide-incl-hooks-react-router-redux-update",
            coupon: "TESTCODE2"
        }
    ]
    var result = await handlerCheckoutCart(courses)
    // if (!Array.isArray(params.courses)) {
    //     return res.status(400).json({ message: "khoá học phải là mảng" })
    // }
    // var result = await handlerCheckoutCart(params.courses)
    result.orderId = orderId
    let isCreated = handlerCreateInvoice(result, user)
    if (!isCreated) return res.status(500).json({ message: "server error" })
    const amount = parseInt(result.totalPrice, 10);
    const now = new Date();

    // NOTE: only set the common required fields and optional fields from all gateways here, redundant fields will invalidate the payload schema checker
    // * Thông tin cần kiểm tra trước khi thanh toán
    const checkoutData = {
        amount,
        clientIp: clientIp.length > 15 ? '127.0.0.1' : clientIp,
        locale: 'vn',
        currency: 'VND',
        // edit at here
        orderId: orderId,
        transactionId: `node-${now.toISOString()}`, // same as orderId (we don't have retry mechanism)
        orderInfo: 'Thanh toan khoa hoc truc tuyen',
        orderType: '190000', // giải trí và giáo dục
    };

    // pass checkoutData to gateway middleware via res.locals
    res.locals.checkoutData = checkoutData;

    // Note: these handler are asynchronous
    let asyncCheckout = null;
    switch (params.paymentMethod) {
        case 'vnPay':
            asyncCheckout = checkoutVNPay(req, res, next);
            break;
        default:
            break;
    }

    if (asyncCheckout) {
        asyncCheckout
            .then(checkoutUrl => {
                res.writeHead(301, { Location: checkoutUrl.href });
                // res.status(301).json({ message: "chuyển hướng", url: checkoutUrl.href })
                res.end();
            })
            .catch(err => {
                res.send(err.message);
            });
    } else {
        res.send('Payment method not found');
    }
}


const getPaymentCallback = async (req, res, next) => {
    try {
        const { gateway } = req.params
        let data = null
        switch (gateway) {
            case 'vnpay':
                data = await callbackVNPay(req, res, next);
                break;
            default:
                break;
        }
        if (data) {
            let invoice = null
            if (data.isSuccess) {
                // update hoá đơn
                invoice = await InvoiceModel.findOneAndUpdate({ _id: data.transactionId }, { transactionId: data.gatewayTransactionNo, status: "Paid" }, { new: true })
            }
            res.status(200).json({ data, invoice })
            if (data.isSuccess) {
                // thêm khoá học đã mua cho người dùng
                let user = invoice.user
                let detailInvoices = await DetailInvoiceModel.find({ invoice: invoice._id }).select('courseId').lean()
                detailInvoices = detailInvoices.map(item => item.courseId)
                for (let i = 0; i < detailInvoices.length; i++) {
                    const course = detailInvoices[i];
                    await MyCourseModel.create({ user, course })
                }
                // cập nhật số lượng bán của khoá học
                await CourseModel.updateMany({ _id: { $in: detailInvoices } }, { $inc: { sellNumber: 1 } })
            }
        } else {
            res.status(500).json({ message: "Callback not found" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" })
    }
}


module.exports = {
    getCheckoutCart,
    postPaymentCheckout,
    getPaymentCallback,
}

