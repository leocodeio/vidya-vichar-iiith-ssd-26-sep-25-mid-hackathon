
import React, { useEffect, useState } from "react";
import {
  fetchQuestions,
  postQuestion,
  updateQuestion,
  clearQuestions,
} from "./api";
import NewQuestionForm from "./components/ref/NewQuestionForm";
import StickyBoard from "./components/ref/StickyBoard";
import { io } from "socket.io-client";
import Filters from "./components/ref/Filters";

const socket = io("http://localhost:5001");

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  const loadQuestions = async (status = null) => {
    setLoading(true);
    setError("");
    try {
      const qs = await fetchQuestions(status);
      setQuestions(qs);
    } catch (err) {
      setError("Failed to load questions", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadQuestions(statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    socket.on("newQuestion", (q) => setQuestions((prev) => [q, ...prev]));
    socket.on("updateQuestion", (q) =>
      setQuestions((prev) => prev.map((p) => (p._id === q._id ? q : p)))
    );
    socket.on("deleteQuestion", (id) =>
      setQuestions((prev) => prev.filter((p) => p._id !== id))
    );
    return () => {
      socket.off("newQuestion");
      socket.off("updateQuestion");
      socket.off("deleteQuestion");
    };
  }, []);

  const addQuestion = async (payload) => {
    try {
      await postQuestion(payload);
      showNotification("Question posted successfully!", "success");
    } catch (err) {
      if (err.response && err.response.status === 409) {
        showNotification("Duplicate question detected!", "warning");
      } else {
        showNotification("Failed to post question", "error");
      }
    }
  };

  const patchQuestion = async (id, body) => {
    try {
      await updateQuestion(id, body);
    } catch {
      showNotification("Failed to update question", "error");
    }
  };

  const clearAll = async () => {
    if (!window.confirm("Are you sure you want to delete all questions?"))
      return;
    try {
      await clearQuestions();
      loadQuestions(statusFilter);
      showNotification("All questions cleared!", "info");
    } catch {
      showNotification("Failed to clear questions", "error");
    }
  };

  const deleteQuestion = async (id) => {
    try {
      // You'll need to add this to your api.js
      // await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      showNotification("Question deleted!", "info");
    } catch {
      showNotification("Failed to delete question", "error");
    }
  };

  const doClear = async (onlyAnswered) => {
    const confirmMessage = onlyAnswered
      ? "Are you sure you want to clear all answered questions?"
      : "Are you sure you want to clear all questions?";

    if (!window.confirm(confirmMessage)) return;

    try {
      await clearQuestions(onlyAnswered);
      loadQuestions(statusFilter);
      showNotification(
        onlyAnswered ? "Answered questions cleared!" : "All questions cleared!",
        "info"
      );
    } catch {
      showNotification("Failed to clear questions", "error");
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${
        type === "success"
          ? "#4caf50"
          : type === "warning"
            ? "#ff9800"
            : type === "error"
              ? "#f44336"
              : "#667eea"
      };
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: slideInDown 0.3s ease-out;
      font-weight: 600;
      max-width: 350px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideInDown 0.3s ease-out reverse";
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  };

  return (
    <div className="app-container">
      {/* Animated Background */}
      <div className="bg-decoration">
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
      </div>

      {/* Header */}
      <div className="header">
        <h1>VidyaVichar</h1>
        <p>Live Questions & Answers Platform</p>
      </div>

      {/* Single Question Form */}
      <div className="question-form-wrapper">
        <NewQuestionForm onAdd={addQuestion} />
      </div>

      {/* Filters */}
      <div className="filters-wrapper">
        <Filters
          status={statusFilter}
          setStatus={setStatusFilter}
          onClear={doClear}
        />
      </div>

      {/* Error and Loading States */}
      {error && (
        <div
          style={{
            textAlign: "center",
            color: "#e74c3c",
            background: "rgba(231, 76, 60, 0.1)",
            padding: "15px",
            borderRadius: "8px",
            margin: "20px 0",
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "rgba(255, 255, 255, 0.8)",
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              marginBottom: "15px",
              animation: "spin 2s linear infinite",
            }}
          >
            ⟳
          </div>
          Loading questions...
        </div>
      )}

      {/* Questions Board */}
      <div className="sticky-board-wrapper">
        <StickyBoard
          questions={questions}
          onUpdate={patchQuestion}
          onDelete={deleteQuestion}
        />
      </div>

      {/* Clear All Button */}
      <div className="clear-all-wrapper">
        <button className="btn-clear-all" onClick={clearAll}>
          <span style={{ marginRight: "8px" }}>🗑️</span>
          Clear All Questions
        </button>
      </div>
    </div>
  );
}
