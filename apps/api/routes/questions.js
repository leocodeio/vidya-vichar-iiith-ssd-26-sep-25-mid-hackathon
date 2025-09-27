import express from "express";
import {
  createQuestion,
  getQuestions,
  updateQuestion,
  clearQuestions,
  addAnswer,
  deleteQuestion,
} from "../controllers/questionController.js";

const router = express.Router();

router.post("/", createQuestion);
router.get("/", getQuestions);
router.patch("/:id", updateQuestion);
router.delete("/", clearQuestions);
router.patch("/:id/answer", addAnswer);
router.delete("/:id", deleteQuestion);

export default router;
