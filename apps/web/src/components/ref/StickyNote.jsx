// import React, { useState } from 'react';

// export default function StickyNote({ q, onUpdate }) {
//   const [answer, setAnswer] = useState(q.answer || "");   // track local answer

//   const mark = (status) => onUpdate(q._id, { status });

//   const saveAnswer = () => {
//     if (answer.trim()) {
//       onUpdate(q._id, { answer: answer.trim() });   // send update to backend
//     }
//   };

//   return (
//     <div className="stickynote">
//       <div className="note-text">{q.text}</div>
//       <div className="note-meta">
//         <div>{q.author} · {new Date(q.createdAt).toLocaleTimeString()}</div>

//         {/* Existing controls */}
//         <div className="controls">
//           {q.status !== 'answered' && (
//             <button onClick={() => mark('answered')}>Mark Answered</button>
//           )}
//           {q.status !== 'important' && (
//             <button onClick={() => mark('important')}>Important</button>
//           )}
//         </div>

//         {/* ✅ New Answer Section */}
//         <div className="answer-section" style={{ marginTop: "10px" }}>
//           <textarea
//             placeholder="Write an answer..."
//             value={answer}
//             onChange={(e) => setAnswer(e.target.value)}
//             rows={2}
//             style={{ width: "100%" }}
//           />
//           <button onClick={saveAnswer} style={{ marginTop: "5px" }}>
//             Save Answer
//           </button>

//           {/* Show saved answer */}
//           {q.answer && (
//             <div className="saved-answer" style={{ marginTop: "8px", fontStyle: "italic" }}>
//               <strong>Answer:</strong> {q.answer}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";

export default function StickyNote({ q, onUpdate, userRole }) {
  const [answer, setAnswer] = useState(q.answer || "");

  const markStatus = (status) => onUpdate(q._id, { status });

  const saveAnswer = () => {
    if (answer.trim())
      onUpdate(q._id, { answer: answer.trim(), status: "answered" });
  };

  return (
    <div className={`stickynote ${q.status}`}>
      <div className="note-text">{q.text}</div>
      <div className="note-meta">
        <div className="author-time">
          {q.author} · {new Date(q.createdAt).toLocaleTimeString()}
        </div>
        {userRole === "faculty" && (
          <>
            <div className="controls">
              {q.status !== "answered" && (
                <button onClick={() => markStatus("answered")}>
                  Mark Answered
                </button>
              )}
              {q.status !== "rejected" && q.status !== "answered" && (
                <button onClick={() => markStatus("rejected")}>Reject</button>
              )}
              <button
                onClick={() =>
                  onUpdate(q._id, {
                    priority:
                      q.priority === "important" ? "normal" : "important",
                  })
                }
              >
                {q.priority === "important" ? "Mark Normal" : "Mark Important"}
              </button>
            </div>

            <div className="answer-section">
              <textarea
                placeholder="Write an answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={2}
              />
              <button onClick={saveAnswer}>Save Answer</button>
            </div>
          </>
        )}

        {q.answer && (
          <div className="saved-answer">
            <strong>Answer:</strong> {q.answer}
          </div>
        )}
      </div>
    </div>
  );
}
