const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const detailInvoiceSchema = new Schema({
    invoice: {
        type: String,
        ref: 'invoice',
        required: true,
    },
    courseId: { type: Schema.Types.ObjectId, ref: 'course', required: true },
    courseSlug: { type: String },
    courseName: { type: String, required: true },
    courseCurrentPrice: { type: Number, required: true },
    courseAuthor: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    couponCode: {
        type: String
    },

    amount: { type: Number, required: true },
    status: String,
},
    {
        timestamps: true
    }
);

const DetailInvoiceModel = mongoose.model('detailInvoice', detailInvoiceSchema, 'detailInvoices');

module.exports = DetailInvoiceModel;
