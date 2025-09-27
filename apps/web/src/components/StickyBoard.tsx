import StickyNote from "./StickyNote";
import type { Question, QuestionUpdatePayload } from "../types/api";

interface StickyBoardProps {
  questions: Question[];
  onUpdate: (id: string, body: QuestionUpdatePayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function StickyBoard({
  questions,
  onUpdate,
  onDelete,
}: StickyBoardProps) {
  if (!questions || questions.length === 0) return <div>No questions yet</div>;
  return (
    <div className="board">
      {questions.map((q) => (
        <StickyNote key={q._id} q={q} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}
