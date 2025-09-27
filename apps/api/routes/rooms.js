import express from "express";
import {
  createRoom,
  joinRoom,
  showRoom,
  createQuestionForRoom,
} from "../controllers/roomController.js";

const router = express.Router();

router.post("/create", createRoom);
router.post("/join", joinRoom);
router.get("/show", showRoom);
router.post("/questions/create", createQuestionForRoom);

export default router;
