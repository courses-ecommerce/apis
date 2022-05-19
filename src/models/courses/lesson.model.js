const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lessonSchema = new Schema({
    _id: {
        type: String,
    },
    chapter: {
        type: Schema.Types.ObjectId,
        ref: "chapter",
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        trim: true,
        required: true
    },
    video: {
        type: String,
        required: true
    },
    text: {
        type: String,
    },
    image: {
        type: String,
    },
    description: {
        type: String,
        default: ""
    },
    saveIn: {
        type: String,
        enum: ['youtube', 'local', 'cloudinary'],
        default: 'cloudinary'
    },
    publish: {
        type: Boolean,
        default: false
    },
});

const LessonModel = mongoose.model('lesson', lessonSchema, 'lessons');

module.exports = LessonModel;
