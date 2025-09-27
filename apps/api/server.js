import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import questionsRouter from "./routes/questions.js";
import roomsRouter from "./routes/rooms.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/vidyavichar";

await connectDB(MONGODB_URI);

app.use("/api/questions", questionsRouter);
app.use("/api/rooms", roomsRouter);

app.get("/", (req, res) => res.send("VidyaVichar API running"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("postQuestion", async (data) => {
    const { roomId, question } = data;
    console.log("postQuestion", data);
    
    // Dynamically importing the Question model
    const Question = (await import("./models/Question.js")).default;
  
    // Create a new Question document with the roomId and question data
    const newQuestion = new Question({ roomId, question });
  
    // Save the new question to the database
    await newQuestion.save();
  
    // Emit the new question to **all clients** connected to the server
    io.emit("newQuestion", newQuestion);
  
    // Emit the new question back to **only the sender** (the client who triggered the event)
    socket.emit("questionPosted", newQuestion);
  });
  

  socket.on("getQuestions", async (data) => {
    const { roomId } = data;
    const Question = (await import("./models/Question.js")).default;
    try {
      const questions = await Question.find({ roomId }).sort({ createdAt: -1 });
      socket.emit("questionsData", questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      socket.emit("error", { message: "Failed to fetch questions" });
    }
  });

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
