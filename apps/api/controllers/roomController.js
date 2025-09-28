import Room from "../models/Room.js";
import Question from "../models/Question.js";

export const createRoom = async (req, res) => {
  try {
    const { roomName, creatorName, creatorId } = req.body;
    if (!roomName) {
      return res.status(400).json({ error: "roomName is required" });
    }
    if (!creatorName) {
      return res.status(400).json({ error: "creatorName is required" });
    }
    if (!creatorId) {
      return res.status(400).json({ error: "creatorId is required" });
    }

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    const room = new Room({
      roomName,
      roomId,
      createdBy: creatorName,
      participants: [{ name: creatorName, participantId: creatorId }],
    });

    await room.save();
    res.status(201).json({
      roomId,
      roomName,
      createdBy: creatorName,
      message: "Room created successfully",
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.query;
    const { name, participantId } = req.body;
    console.log(name, participantId);
    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }
    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }
    if (!participantId) {
      return res.status(400).json({ error: "participantId is required" });
    }

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const existingParticipant = room.participants.find((p) => p.name === name);
    if (!existingParticipant) {
      room.participants.push({ name, participantId });
      await room.save();
    } else if (!existingParticipant.participantId) {
      existingParticipant.participantId = participantId;
      await room.save();
    }

    res.status(200).json({
      message: "Successfully joined room",
      roomId,
      roomName: room.roomName,
    });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ error: "Failed to join room" });
  }
};

export const showRoom = async (req, res) => {
  try {
    const { roomId } = req.query;
    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.status(200).json({
      roomId: room.roomId,
      roomName: room.roomName,
      participants: room.participants,
      createdAt: room.createdAt,
      isActive: room.isActive,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    res.status(500).json({ error: "Failed to fetch room" });
  }
};

export const createQuestionForRoom = async (req, res) => {
  try {
    const { roomId } = req.query;
    const { question } = req.body;

    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }
    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const newQuestion = new Question({
      text: question,
      roomId: roomId,
    });

    await newQuestion.save();

    const io = req.app.get("io");
    io.emit("newQuestion", { roomId, question: newQuestion });

    res.status(201).json({
      message: "Question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ error: "Failed to create question" });
  }
};
