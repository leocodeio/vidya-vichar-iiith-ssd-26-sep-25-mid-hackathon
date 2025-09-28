import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import questionsRouter from "./routes/questions.js";
import roomsRouter from "./routes/rooms.js";
import authRouter from "./routes/auth.js";
import { protect } from "./middleware/auth.js";

dotenv.config();
const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3001;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/vidyavichar";

await connectDB(MONGODB_URI);

app.use("/api/questions", protect, questionsRouter);
app.use("/api/rooms", protect, roomsRouter);
app.use("/api/auth", authRouter);

app.get("/", (req, res) => res.send("VidyaVichar API running"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // The front-end URL (adjust this based on your actual client URL)
    methods: ["GET", "POST"], // Allowed HTTP methods
    credentials: true, // Allow cookies to be sent across domains
  },
});

app.set("io", io);

// Socket auth middleware
io.use(async (socket, next) => {
  try {
    console.log(socket.handshake.auth); // Log to verify token is received
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const User = (await import("./models/User.js")).default;
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new Error("Authentication error"));
    }
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id, "User:", socket.user.username);

  // 1) Handle the postQuestion event
  socket.on("postQuestion", async (data) => {
    try {
      if (socket.user.role !== "student") {
        socket.emit("error", { message: "Only students can post questions" });
        return;
      }
      const { roomId, question } = data;
      if (!roomId || !question || !question.trim()) {
        socket.emit("error", { message: "Room ID and question are required" });
        return;
      }

      // 1) check if roomId is valid
      const Room = (await import("./models/Room.js")).default;
      const room = await Room.findOne({ roomId });
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      // 2) prevent duplicate in room
      const Question = (await import("./models/Question.js")).default;
      const existing = await Question.findOne({
        text: question.trim(),
        roomId,
      });
      if (existing) {
        socket.emit("error", { message: "Duplicate question in this room" });
        return;
      }

      // 3) create a new question
      const newQuestion = new Question({
        roomId,
        text: question.trim(),
        author: socket.user.username,
      });
      await newQuestion.save();

      // 4) emit the new question to all connected clients
      io.emit("questionPosted", newQuestion);
    } catch (error) {
      console.error("Error posting question:", error);
      socket.emit("error", { message: "Failed to post question" });
    }
  });

  // 2) Handle the manageQuestion event
  socket.on("manageQuestion", async (data) => {
    if (socket.user.role !== "faculty") {
      socket.emit("error", { message: "Only faculty can manage questions" });
      return;
    }
    const { roomId, questionId, status, answer, priority } = data;
    const Question = (await import("./models/Question.js")).default;
    try {
      const update = {};
      if (status && ["answered", "rejected"].includes(status))
        update.status = status;
      if (answer !== undefined) update.answer = answer;
      if (priority && ["important", "normal"].includes(priority))
        update.priority = priority;

      const question = await Question.findByIdAndUpdate(questionId, update, {
        new: true,
      });
      if (question) {
        io.emit("updateQuestion", question);
      }
    } catch (error) {
      console.error("Error managing question:", error);
      socket.emit("error", { message: "Failed to manage question" });
    }
  });

  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
