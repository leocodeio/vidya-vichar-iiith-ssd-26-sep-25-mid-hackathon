import express from "express";
import {
  createRoom,
  joinRoom,
  showRoom,
  createQuestionForRoom,
} from "../controllers/roomController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

const router = express.Router();

router.post("/create", protect, authorize("faculty"), createRoom);
router.post("/join", protect, joinRoom);
router.get("/show", protect, showRoom);
router.post("/questions/create", protect, createQuestionForRoom);

export default router;
