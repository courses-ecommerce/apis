const mongoose = require("mongoose");
const Schema = mongoose.Schema

const myCourseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user',
    },
    course: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'course',
    }
}, { timestamps: true })


const MyCourseModel = mongoose.model('myCourse', myCourseSchema, 'myCourses');
module.exports = MyCourseModel