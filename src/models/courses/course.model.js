const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var slug = require('mongoose-slug-updater');
mongoose.plugin(slug);

const courseSchema = new Schema({
    slug: {
        type: String,
        slug: "name",
        unique: true,
        slugPaddingSize: 2,
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "category"
    },
    thumbnail: {
        type: String,
    },
    description: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: "Tiếng Việt"
    },
    // dành cho đối tượng nào? 
    intendedLearners: {
        type: [String],
    },
    requirements: {
        type: [String],
    },
    targets: {
        type: [String],
        required: true
    },
    level: {
        type: String,
        enum: ["Sơ cấp", "Trung cấp", "Cao cấp", "Tất cả"],
        default: "Tất cả"
    },
    currentPrice: {
        type: Number,
        default: 0,
        required: true,
    },
    originalPrice: {
        type: Number,
        default: 0,
        required: true,
    },
    saleOff: {
        type: Number,
        default: 0
    },
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user',
    },
    sellNumber: {
        type: Number,
        default: 0
    },
    //ex: #nodejs, #expressjs
    hashtags: {
        type: [String]
    },
    publish: {
        type: Boolean,
        default: false
    },
},
    {
        timestamps: true
    }
);

courseSchema.index({ name: 'text', slug: 'text' })

const CourseModel = mongoose.model('course', courseSchema, 'courses');

module.exports = CourseModel;
