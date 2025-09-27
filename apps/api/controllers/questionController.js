const Question = require('../models/Question');

exports.createQuestion = async (req, res) => {
  try {
    const { text, author } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Question text required' });

    // prevent exact-duplicate text within short time window (simple duplicate prevention)
    const recentSame = await Question.findOne({ text: text.trim() });
    if (recentSame) {
      return res.status(409).json({ message: 'Duplicate question' });
    }

    const q = new Question({ text: text.trim(), author: author ? author.trim() : undefined });
    await q.save();
    const io = req.app.get("io");
    io.emit("newQuestion", q);

    res.status(201).json(q);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const { status } = req.query; // optional filter
    const filter = {};
    if (status) filter.status = status;
    const qs = await Question.find(filter).sort({ createdAt: -1 });
    res.json(qs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, answer } = req.body;

    const update = {};
    if (status && ['unanswered','answered','important'].includes(status)) update.status = status;
    if (answer !== undefined) update.answer = answer; // include answer updates

    const q = await Question.findByIdAndUpdate(id, update, { new: true });
    if (!q) return res.status(404).json({ message: 'Not found' });

    // Emit to all clients (socket.io)
    const io = req.app.get('io');  
    if(io) io.emit('updateQuestion', q);

    res.json(q);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.clearQuestions = async (req, res) => {
  try {
    // Optionally allow clearing only answered.
    const { onlyAnswered } = req.query;
    if (onlyAnswered === 'true') {
      await Question.deleteMany({ status: 'answered' });
    } else {
      await Question.deleteMany({});
    }
    const io = req.app.get("io");
    io.emit("clearQuestions");
    res.json({ message: 'Cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    const updated = await Question.findByIdAndUpdate(
      id,
      { answer, status: "answered" },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Not found" });
    req.io.emit("updateQuestion", updated);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to add answer" });
  }
};
// exports.deleteQuestion = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const q = await Question.findByIdAndDelete(id);
//     if (!q) return res.status(404).json({ message: "Not found" });

//     const io = req.app.get("io");
//     io.emit("deleteQuestion", id);

//     res.json({ message: "Deleted", id });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

