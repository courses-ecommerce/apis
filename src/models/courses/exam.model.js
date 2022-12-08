const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answeredSchema = new Schema({
  question: {
    type: Schema.Types.ObjectId,
    ref: "quiz",
    required: true,
  },
  answer: {
    type: Array,
    default: []
  },
});

const examSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "lesson",
      required: true,
    },
    scores: {
      type: Number,
    },
    answered: [answeredSchema],
  },
  {
    timestamps: true,
  }
);

const ChapterModel = mongoose.model("exam", examSchema, "exams");

module.exports = ChapterModel;

