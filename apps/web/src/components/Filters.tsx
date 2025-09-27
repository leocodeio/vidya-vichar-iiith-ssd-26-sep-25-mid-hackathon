import type { Question } from "../types/api";

interface FiltersProps {
  status: Question["status"] | null;
  setStatus: (status: Question["status"] | null) => void;
  onClear: (onlyAnswered: boolean) => void;
}

export default function Filters({ status, setStatus, onClear }: FiltersProps) {
  return (
    <div className="filter-bar">
      <select
        value={status || ""}
        onChange={(e) =>
          setStatus((e.target.value as Question["status"]) || null)
        }
      >
        <option value="">All Questions</option>
        <option value="unanswered">Unanswered</option>
        <option value="answered">Answered</option>
        <option value="important">Important</option>
      </select>

      <button className="btn-secondary" onClick={() => onClear(true)}>
        <span style={{ marginRight: "6px" }}>✓</span>
        Clear Answered
      </button>

      <button className="btn-danger" onClick={() => onClear(false)}>
        <span style={{ marginRight: "6px" }}>🗑️</span>
        Clear All
      </button>
    </div>
  );
}
