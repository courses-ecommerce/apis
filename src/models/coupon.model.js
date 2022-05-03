const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
    code: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["percent", "money"],
        require: true,
    },
    apply: { // ex: {to: 'author', value:'userId', except:['courseIdhot1'] } or {to:'category', value:'categorySlug'} {to:'all/user', value:""}
        to: {
            type: String,
            enum: ['author', 'all', 'category', 'new user'],
            default: 'author'
        },
        value: {
            type: [String],
        },
    },
    amount: {
        type: Number, // if type == percent,then amount <= 100 ,else it’s amount of discount
        required: true
    },
    startDate: {
        type: Date,
        required: true,
        default: new Date()
    },
    expireDate: {
        type: Date,
        require: true,
        default: new Date().setDate(new Date().getDate() + 7)
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    maxDiscount: {
        type: Number,
        default: Infinity
    },
    minPrice: {
        type: Number,
        default: 0
    },
    number: {
        type: Number,
        default: Infinity
    },
});

const CouponModel = mongoose.model('coupon', couponSchema, 'coupons');

module.exports = CouponModel;
