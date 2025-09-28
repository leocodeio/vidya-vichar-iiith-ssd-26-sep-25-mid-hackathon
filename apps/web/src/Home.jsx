// React hooks for managing state and side-effects
import React, { useEffect, useState } from "react";
// API functions for fetching and managing questions
import {
  fetchQuestions,
  postQuestion,
  updateQuestion,
  clearQuestions,
} from "./api";
// Components for adding new questions and displaying them
import NewQuestionForm from "./components/ref/NewQuestionForm";
import StickyBoard from "./components/ref/StickyBoard";
// Socket.IO client for real-time updates
import { io } from "socket.io-client";
// Filters component to filter questions
import Filters from "./components/ref/Filters";

// Initialize socket connection to server
const socket = io("http://localhost:5001");

// Main App component
export default function App() {
  // State variables
  const [questions, setQuestions] = useState([]); // List of questions
  const [loading, setLoading] = useState(false); // Loading state for data fetch
  const [error, setError] = useState(""); // Error message
  const [statusFilter, setStatusFilter] = useState(null); // Filter for question status

  // Function to load questions from API, optionally filtered by status
  const loadQuestions = async (status = null) => {
    setLoading(true); // Show loading spinner
    setError(""); // Reset previous errors
    try {
      const qs = await fetchQuestions(status); // Fetch questions from API
      setQuestions(qs); // Update state with fetched questions
    } catch (err) {
      setError("Failed to load questions", err); // Set error if fetch fails
    }
    setLoading(false); // Stop loading spinner
  };

  // Effect to reload questions whenever the status filter changes
  useEffect(() => {
    loadQuestions(statusFilter);
  }, [statusFilter]);

  // Effect to handle real-time socket events
  useEffect(() => {
    // New question posted
    socket.on("newQuestion", (q) => setQuestions((prev) => [q, ...prev]));

    // Existing question updated
    socket.on("updateQuestion", (q) =>
      setQuestions((prev) => prev.map((p) => (p._id === q._id ? q : p)))
    );

    // Question deleted
    socket.on("deleteQuestion", (id) =>
      setQuestions((prev) => prev.filter((p) => p._id !== id))
    );

    // Cleanup listeners on unmount
    return () => {
      socket.off("newQuestion");
      socket.off("updateQuestion");
      socket.off("deleteQuestion");
    };
  }, []);

  // Function to add a new question via API
  const addQuestion = async (payload) => {
    try {
      await postQuestion(payload);
      showNotification("Question posted successfully!", "success"); // Notify success
    } catch (err) {
      if (err.response && err.response.status === 409) {
        showNotification("Duplicate question detected!", "warning"); // Notify duplicate
      } else {
        showNotification("Failed to post question", "error"); // Notify failure
      }
    }
  };

  // Function to update an existing question via API
  const patchQuestion = async (id, body) => {
    try {
      await updateQuestion(id, body);
    } catch {
      showNotification("Failed to update question", "error");
    }
  };

  // Function to clear all questions
  const clearAll = async () => {
    if (!window.confirm("Are you sure you want to delete all questions?"))
      return; // Confirm action with user
    try {
      await clearQuestions(); // API call to clear questions
      loadQuestions(statusFilter); // Reload questions
      showNotification("All questions cleared!", "info"); // Notify user
    } catch {
      showNotification("Failed to clear questions", "error");
    }
  };

  // Function to delete a specific question
  const deleteQuestion = async (id) => {
    try {
      // Uncomment if you add deleteQuestion API
      // await deleteQuestion(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id)); // Remove from state
      showNotification("Question deleted!", "info");
    } catch {
      showNotification("Failed to delete question", "error");
    }
  };

  // Function to clear questions conditionally (all or only answered)
  const doClear = async (onlyAnswered) => {
    const confirmMessage = onlyAnswered
      ? "Are you sure you want to clear all answered questions?"
      : "Are you sure you want to clear all questions?";

    if (!window.confirm(confirmMessage)) return;

    try {
      await clearQuestions(onlyAnswered); // API call with optional filter
      loadQuestions(statusFilter); // Reload questions
      showNotification(
        onlyAnswered ? "Answered questions cleared!" : "All questions cleared!",
        "info"
      );
    } catch {
      showNotification("Failed to clear questions", "error");
    }
  };

  // Utility function to show temporary notifications
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

  // JSX for rendering the App UI
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
        <p>Live Q&A Platform</p>
      </div>

      {/* Single Question Form */}
      <div className="question-form-wrapper">
        <NewQuestionForm onAdd={addQuestion} />
      </div>

      {/* Filters Component */}
      <div className="filters-wrapper">
        <Filters
          status={statusFilter} // Current filter
          setStatus={setStatusFilter} // Function to update filter
          onClear={doClear} // Function to clear questions
        />
      </div>

      {/* Display error messages */}
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

      {/* Display loading state */}
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
          questions={questions} // Pass questions to board
          onUpdate={patchQuestion} // Update handler
          onDelete={deleteQuestion} // Delete handler
        />
      </div>

      {/* Clear All Questions Button */}
      <div className="clear-all-wrapper">
        <button className="btn-clear-all" onClick={clearAll}>
          <span style={{ marginRight: "8px" }}>🗑️</span>
          Clear All Questions
        </button>
      </div>
    </div>
  );
}
