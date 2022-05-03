const { checkoutVNPay, callbackVNPay } = require('../payment/vnpay.controller')
const InvoiceModel = require('../../models/invoice.model')
const DetailInvoiceModel = require('../../models/detailInvoice.model');
const CouponModel = require('../../models/coupon.model');
var uniqid = require('uniqid');
const CourseModel = require('../../models/courses/course.model');


/** "user":"userid"
 *  "orderId":"54as4d6asd65as4d3",
 *  "totalPrice": 50,
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
        },
        {
            "_id": "62530745427f22199612e153",
            "name": "React - The Complete Guide (incl Hooks, React Router, Redux) (update)",
            "thumbnail": "uri/test.jpg",
            "currentPrice": 50,
            "originalPrice": 100,
            "saleOff": 50,
            "author": "625060fe1d697fe08f940a5e",
            "slug": "react-the-complete-guide-incl-hooks-react-router-redux-update",
            "category": "6253baa59bcefe119ccc76b5",
            "amount": 30,
            "coupon": {
                "message": "Áp dụng thành công",
                "discountAmount": 20,
                "code": "TESTCODE2",
                "title": "test",
                "type": "percent",
                "amount": 60
            }
        }
    ]
 */
const handlerCreateInvoice = async (data) => {
    try {
        const invoice = await InvoiceModel.create({
            _id: data.orderId,
            transactionId: "",
            user: data.user,
            totalPrice: data.totalPrice,
        })
        // tạo detail
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


// xử lý giỏ hàng 
/**
 * @returns {amount, data}
 */
const handlerCheckoutCart = async (courses) => {
    // if (!Array.isArray(courses)) {
    //     throw Error('courses must be array')
    // }
    try {
        var data = []
        var amount = 0
        // xử lý thông tin
        for (let i = 0; i < courses.length; i++) {
            const item = courses[i];

            // lấy thông tin khoá học và mã giảm giá
            var course = await CourseModel.findOne(
                {
                    slug: item.slug,
                    publish: true
                }
            ).select("_id name slug thumbnail currentPrice  originalPrice saleOff category author").lean()

            if (!course) { continue }

            // giá tiền cần trả ước tính
            course.amount = course.currentPrice
            // có mã giảm giá
            if (item.coupon) {
                const coupon = await CouponModel.findOne({ code: item.coupon }).lean()

                // mã hợp lệ ? check áp dụng thành công 
                if (coupon) {
                    // check mã có dùng được cho khoá học này
                    let isApply = false
                    // kiểm tra loại áp dung
                    switch (coupon.apply.to) {
                        case 'all':
                            isApply = coupon.minPrice <= course.currentPrice && coupon.number >= 1
                            break
                        case 'author':
                            isApply = JSON.stringify(coupon.author) == JSON.stringify(course.author) && coupon.minPrice <= course.currentPrice && coupon.number >= 1
                            break
                        case 'category':
                            isApply = coupon.apply.value.some(item => JSON.stringify(item) == JSON.stringify(course.category)) && coupon.minPrice <= course.currentPrice && coupon.number >= 1
                            break
                    }
                    // tính tiền giảm nếu áp dụng thành công
                    let discountAmount = 0
                    if (isApply) {
                        // tính tiền giảm giá theo tiền mặt và giảm giá %
                        discountAmount = coupon.type === 'money' ? coupon.amount : coupon.amount * course.currentPrice / 100
                        // tiền giảm giá có vượt giá trị giảm tối đa ?
                        if (discountAmount > coupon.maxDiscount) {
                            discountAmount = coupon.maxDiscount
                        }
                    }
                    // add coupon cho course
                    course.coupon = {
                        message: isApply ? "Áp dụng thành công" : "Mã không thể dùng",
                        discountAmount,
                        code: coupon.code,
                        title: coupon.title,
                        type: coupon.type,
                        amount: coupon.amount,
                    }
                    // giá tiền ước tính
                    course.amount = course.currentPrice - discountAmount
                }
                // mã không hợp lệ 
                else {
                    // thông báo mã không hợp lệ
                    course.coupon = { message: "Invalid Coupon" }
                }
            }
            // tính tổng tiền thanh toán
            amount += course.amount
            // lưu data checkout
            data.push(course)
        }
        return { totalPrice: amount, courses: data }
    } catch (error) {
        throw error
    }
}



// fn: lấy thông tin khoá học để checkout thanh toán khoá học
/** postCheckoutCart
 * @param {Object} req.body
 * @param {Array} res.body.courses ex: [{ slug: 'slug1', coupon: 'magiamgia1' }, { slug: 'slug2' }, { slug: 'slug3', coupon: 'magiamgia3'}]
 */
const postCheckoutCart = async (req, res, next) => {
    try {
        var { courses } = req.body
        // xử lý giỏ hàng
        const result = await handlerCheckoutCart(courses)

        return res.status(200).json({ message: "ok", totalPrice: result.amount, data: result.data })
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
    const params = Object.assign({}, req.body);

    let orderId = uniqid()
    const clientIp =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);

    var result = await handlerCheckoutCart(courses)
    result.user = req.user
    result.orderId = orderId
    let isCreated = await handlerCreateInvoice(result)
    if (!isCreated) return res.status(500).json({ message: "server error" })

    const amount = parseInt(result.amount, 10);
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
                // tạo hoá đơn
                invoice = await InvoiceModel.updateOne({ _id: data.invoiceId }, { transactionId: data.transactionId, status: "Paid" })
            }
            res.status(200).json({ data, invoice })
        } else {
            res.status(500).json({ message: "Callback not found" })
        }
    } catch (error) {

    }
}


module.exports = {
    postCheckoutCart,
    postPaymentCheckout,
    getPaymentCallback,
}

