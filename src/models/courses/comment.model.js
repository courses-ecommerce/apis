const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'course',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    replies: {
        type: Array,
        author: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        content: {
            type: String,
            required: true
        },
    }
},
    {
        timestamps: true
    }
);


const CommentModel = mongoose.model('comment', commentSchema, 'comments');

module.exports = CommentModel;
