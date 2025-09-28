import Question from "../models/Question.js";

export const createQuestion = async (req, res) => {
  try {
    const { text, author, roomId } = req.body;
    if (!text || !text.trim())
      return res.status(400).json({ message: "Question text required" });
    if (!roomId) return res.status(400).json({ message: "Room ID required" });

    // prevent exact-duplicate text within the same room
    const existing = await Question.findOne({ text: text.trim(), roomId });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Duplicate question in this room" });
    }

    const q = new Question({
      text: text.trim(),
      author: author ? author.trim() : req.user.username || "Anonymous",
      roomId,
    });
    await q.save();
    const io = req.app.get("io");
    io.emit("newQuestion", q);

    res.status(201).json(q);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const { status, roomId } = req.query; // optional filters
    const filter = {};
    if (status) filter.status = status;
    if (roomId) filter.roomId = roomId;
    const qs = await Question.find(filter).sort({ createdAt: -1 });
    res.json(qs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, answer, priority } = req.body;

    const update = {};
    if (status && ["unanswered", "addressed", "rejected"].includes(status))
      update.status = status;
    if (answer !== undefined) update.answer = answer;
    if (priority && ["important", "normal"].includes(priority))
      update.priority = priority;

    const q = await Question.findByIdAndUpdate(id, update, { new: true });
    if (!q) return res.status(404).json({ message: "Not found" });

    // Emit to all clients (socket.io)
    const io = req.app.get("io");
    if (io) io.emit("updateQuestion", q);

    res.json(q);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const clearQuestions = async (req, res) => {
  try {
    // Optionally allow clearing only answered.
    const { onlyAnswered } = req.query;
    if (onlyAnswered === "true") {
      await Question.deleteMany({ status: "addressed" });
    } else {
      await Question.deleteMany({});
    }
    const io = req.app.get("io");
    io.emit("clearQuestions");
    res.json({ message: "Cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    const updated = await Question.findByIdAndUpdate(
      id,
      { answer, status: "addressed" },
      { new: true },
    );

    if (!updated) return res.status(404).json({ error: "Not found" });
    const io = req.app.get("io");
    io.emit("updateQuestion", updated);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to add answer" });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const q = await Question.findByIdAndDelete(id);
    if (!q) return res.status(404).json({ message: "Not found" });

    const io = req.app.get("io");
    io.emit("deleteQuestion", id);

    res.json({ message: "Deleted", id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
