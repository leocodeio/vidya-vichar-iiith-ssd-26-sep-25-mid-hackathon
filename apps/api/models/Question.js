import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  author: { type: String, default: "Anonymous", trim: true },
  roomId: { type: String, required: true },
  status: {
    type: String,
    enum: ["unanswered", "addressed", "rejected"],
    default: "unanswered",
  },
  answer: { type: String, default: "" },
  priority: {
    type: String,
    enum: ["important", "normal"],
    default: "normal",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Question", QuestionSchema);
