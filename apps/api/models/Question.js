const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  author: { type: String, default: 'Anonymous', trim: true },
  status: { type: String, enum: ['unanswered', 'answered', 'important'], default: 'unanswered' },
  answer:{type: String, default: ""},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', QuestionSchema);
