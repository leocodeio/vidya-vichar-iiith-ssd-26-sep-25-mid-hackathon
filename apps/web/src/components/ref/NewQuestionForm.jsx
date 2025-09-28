import React, { useState } from "react";

export default function NewQuestionForm({ onAdd }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!text.trim()) {
      setError("Question cannot be empty");
      return;
    }

    // Basic length guard
    if (text.trim().length > 500) {
      setError("Question too long (max 500 characters)");
      return;
    }

    await onAdd({
      text: text.trim(),
    });

    setText("");
  };

  return (
    <form className="form" onSubmit={submit}>
      <textarea
        placeholder="What's your question? Share your thoughts or ask anything..."
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
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
