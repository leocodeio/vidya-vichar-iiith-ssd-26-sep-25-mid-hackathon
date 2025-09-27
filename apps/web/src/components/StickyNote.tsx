import { useState } from "react";
import type { Question, QuestionUpdatePayload } from "../types/api";

interface StickyNoteProps {
  q: Question;
  onUpdate: (id: string, payload: QuestionUpdatePayload) => void;
  onDelete: (id: string) => void;
}

export default function StickyNote({ q, onUpdate, onDelete }: StickyNoteProps) {
  const [answer, setAnswer] = useState<string>(q.answer || "");

  const markStatus = (status: Question["status"]) =>
    onUpdate(q._id, { status });

  const saveAnswer = () => {
    if (answer.trim()) onUpdate(q._id, { answer: answer.trim() });
  };

  const handleDeleteAnswer = async (id: string) => {
    await fetch(`/api/questions/${id}/delete-answer`, { method: "PATCH" });
  };

  return (
    <div className={`stickynote ${q.status}`}>
      <div className="note-text">{q.text}</div>
      <div className="note-meta">
        <div className="author-time">
          {q.author} · {new Date(q.createdAt).toLocaleTimeString()}
        </div>
        <div className="controls">
          {q.status !== "answered" && (
            <button onClick={() => markStatus("answered")}>
              Mark Answered
            </button>
          )}
          {q.status !== "important" && (
            <button onClick={() => markStatus("important")}>Important</button>
          )}
          <button onClick={() => onDelete(q._id)}>Delete</button>
        </div>

        <div className="answer-section">
          <textarea
            placeholder="Write an answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={2}
          />
          <button onClick={saveAnswer}>Save Answer</button>
          {q.answer && (
            <button onClick={() => handleDeleteAnswer(q._id)}>
              Delete Answer
            </button>
          )}
        </div>

        {q.answer && (
          <div className="saved-answer">
            <strong>Answer:</strong> {q.answer}
          </div>
        )}
      </div>
    </div>
  );
}
