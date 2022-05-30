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
    },
    progress: {
        type: [Object],
        lessonId: {
            type: Schema.Types.ObjectId,
            ref: "lesson"
        },
        timeline: {
            type: String,
            default: null
        },
        complete: { type: Boolean, default: false }
    }
}
    // , { timestamps: true }
)


const MyCourseModel = mongoose.model('myCourse', myCourseSchema, 'myCourses');
module.exports = MyCourseModel