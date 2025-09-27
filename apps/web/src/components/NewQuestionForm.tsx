import { useState } from "react";
import type { QuestionCreatePayload } from "../types/api";

interface NewQuestionFormProps {
  onAdd: (payload: QuestionCreatePayload) => Promise<void>;
}

export default function NewQuestionForm({ onAdd }: NewQuestionFormProps) {
  const [text, setText] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [error, setError] = useState<string>("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!text.trim()) {
      setError("Question cannot be empty");
      return;
    }

    if (text.trim().length > 500) {
      setError("Question too long (max 500 characters)");
      return;
    }

    await onAdd({
      text: text.trim(),
      author: author.trim() || "Anonymous",
    });

    setText("");
    setAuthor("");
  };

  return (
    <form className="form" onSubmit={submit}>
      <textarea
        placeholder="What's your question? Share your thoughts or ask anything..."
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input
        placeholder="Your name (optional)"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />
      <div className="form-actions">
        <button type="submit" className="btn-primary">
          <span style={{ marginRight: "8px" }}>✈️</span>
          Post Question
        </button>
        {error && (
          <div className="error-message">
            <span style={{ marginRight: "5px" }}>⚠️</span>
            {error}
          </div>
        )}
      </div>
    </form>
  );
}
