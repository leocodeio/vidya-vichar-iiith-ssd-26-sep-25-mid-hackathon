import React from "react";
import StickyNote from "./StickyNote";

export default function StickyBoard({
  questions,
  onUpdate,
  userRole,
  viewType = "grid",
}) {
  if (!questions || questions.length === 0) return <div>No questions yet</div>;

  const gridClasses = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
  const listClasses = "flex flex-col space-y-3";

  return (
    <div className={viewType === "grid" ? gridClasses : listClasses}>
      {questions.map((q) => (
        <StickyNote
          key={q._id}
          q={q}
          onUpdate={onUpdate}
          userRole={userRole}
          viewType={viewType}
        />
      ))}
    </div>
  );
}
