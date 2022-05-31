const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const codeSchema = new Schema({
    coupon: {
        type: Schema.Types.ObjectId,
        ref: 'coupon',
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const CodeModel = mongoose.model('code', codeSchema, 'codes');

module.exports = CodeModel;
