import express from "express";
import {
  createQuestion,
  getQuestions,
  updateQuestion,
  clearQuestions,
  addAnswer,
  deleteQuestion,
} from "../controllers/questionController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

const router = express.Router();

router.post("/", protect, authorize("student"), createQuestion);
router.get("/", protect, authorize("faculty", "ta"), getQuestions);
router.patch("/:id", protect, authorize("faculty"), updateQuestion);
router.delete("/", protect, authorize("faculty"), clearQuestions);
router.patch("/:id/answer", protect, authorize("faculty"), addAnswer);
router.delete("/:id", protect, authorize("faculty"), deleteQuestion);

export default router;
