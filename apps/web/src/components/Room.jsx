import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { fetchQuestions, deleteQuestion } from "../api";
import StickyBoard from "./ref/StickyBoard";
import NewQuestionForm from "./ref/NewQuestionForm";

import { Button } from "./ui/button";

const SOCKET_URL = "http://localhost:5000";

export default function Room() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [socket, setSocket] = useState(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!user) return;

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    const newSocket = io(SOCKET_URL, {
      auth: { token },
    });

    newSocket.on("connect", () => console.log("Connected to socket"));
    newSocket.on("questionPosted", (question) => {
      setQuestions((prev) => [question, ...prev]);
    });
    newSocket.on("questionUpdated", ({ question }) => {
      setQuestions((prev) =>
        prev.map((q) => (q._id === question._id ? question : q)),
      );
    });
    newSocket.on("questionDeleted", (id) => {
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    });

    setSocket(newSocket);

    // Fetch existing questions
    fetchQuestions({ roomId }).then(setQuestions);

    return () => newSocket.disconnect();
  }, [roomId, user]);

  const handleAddQuestion = (data) => {
    if (socket) {
      socket.emit("postQuestion", { roomId, question: data.text });
    }
  };

  const handleUpdateQuestion = (id, updates) => {
    if (socket) {
      socket.emit("manageQuestion", { roomId, questionId: id, ...updates });
    }
  };

  const handleDeleteQuestion = async (id) => {
    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (error) {
      console.error("Delete failed");
    }
  };

  const filteredQuestions = questions.filter(
    (q) => !filter || q.status === filter,
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Room: {roomId}</h1>
        <div className="mb-4">
          <NewQuestionForm onAdd={handleAddQuestion} />
        </div>
        <div className="mb-4">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Questions</option>
            <option value="unanswered">Unanswered</option>
            <option value="addressed">Addressed</option>
            <option value="important">Important</option>
          </select>
          <Button
            onClick={() => setFilter("")}
            variant="outline"
            className="ml-2"
          >
            Clear Filter
          </Button>
        </div>
        <StickyBoard
          questions={filteredQuestions}
          onUpdate={handleUpdateQuestion}
          onDelete={handleDeleteQuestion}
        />
      </div>
    </div>
  );
}
