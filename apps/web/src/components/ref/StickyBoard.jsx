import React from "react";
import StickyNote from "./StickyNote";

export default function StickyBoard({
  questions,
  onUpdate,
  onDelete,
  userRole,
}) {
  if (!questions || questions.length === 0) return <div>No questions yet</div>;
  return (
    <div className="board">
      {questions.map((q) => (
        <StickyNote
          key={q._id}
          q={q}
          onUpdate={onUpdate}
          onDelete={onDelete}
          userRole={userRole}
        />
      ))}
    </div>
  );
}
