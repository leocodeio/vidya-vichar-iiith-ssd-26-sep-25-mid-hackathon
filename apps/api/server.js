import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import questionsRouter from "./routes/questions.js";
import roomsRouter from "./routes/rooms.js";
import authRouter from "./routes/auth.js";
import { protect } from "./middleware/auth.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/vidyavichar";

await connectDB(MONGODB_URI);

app.use("/api/questions",protect, questionsRouter);
app.use("/api/rooms",protect, roomsRouter);
app.use("/api/auth", authRouter);

app.get("/", (req, res) => res.send("VidyaVichar API running"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // 1) Handle the postQuestion event
  socket.on("postQuestion", async (data) => {
    try {
      console.log("Received postQuestion:", data);
      const { roomId, question } = data;
      if (!roomId || !question) {
        socket.emit("error", { message: "Room ID and question are required" });
        return;
      }
      const Question = (await import("./models/Question.js")).default;

      // 1) check if roomId is valid
      const Room = (await import("./models/Room.js")).default;
      const room = await Room.findOne({ roomId });
      if (!room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      // 2) create a new question
      const newQuestion = new Question({ roomId, question });
      await newQuestion.save();

      // 3) emit the new question to all connected clients
      io.emit("questionPosted", newQuestion);

      // 4) emit the new question to the sender
      socket.emit("questionPosted", newQuestion);
      io.emit("questionPosted", data);
    } catch (error) {
      console.error("Error posting question:", error);
      socket.emit("error", { message: "Failed to post question" });
    }
  });

  // 2) Handle the manageQuestion event
  socket.on("manageQuestion", async (data) => {
    const { roomId, questionId, status, answer, priority } = data;
    const Question = (await import("./models/Question.js")).default;
    try {
      const update = {};
      if (status && ["addressed", "rejected"].includes(status))
        update.status = status;
      if (answer !== undefined) update.answer = answer;
      if (priority && ["important", "normal"].includes(priority))
        update.priority = priority;

      const question = await Question.findByIdAndUpdate(questionId, update, {
        new: true,
      });
      if (question) {
        io.emit("questionUpdated", { roomId, question });
      }
    } catch (error) {
      console.error("Error managing question:", error);
      socket.emit("error", { message: "Failed to manage question" });
    }
  });

  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
