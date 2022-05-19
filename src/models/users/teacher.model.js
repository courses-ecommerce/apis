const mongoose = require("mongoose");
const Schema = mongoose.Schema

const teacherSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user',
    },
    payments: {
        accountNumber: { type: String },
        cardNumber: { type: String },
        name: { type: String }
    },
    description: {
        type: String
    }
})



const TeacherModel = mongoose.model('teacher', teacherSchema, 'teachers');
module.exports = TeacherModel