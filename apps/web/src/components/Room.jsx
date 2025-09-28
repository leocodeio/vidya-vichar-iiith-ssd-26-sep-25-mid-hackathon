import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { fetchQuestions, clearQuestions, showRoom } from "../api";
import { toast } from "sonner";
import StickyBoard from "./ref/StickyBoard";
import NewQuestionForm from "./ref/NewQuestionForm";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SOCKET_URL = "http://localhost:3001";

export default function Room() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [socket, setSocket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isParticipant, setIsParticipant] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("user", user);
    if (authLoading) return;
    if (!user) navigate("/");

    const checkAccess = async () => {
      try {
        const room = await showRoom(roomId);
        console.log("room", room);
        const isUserParticipant = room.participants.some(
          (p) => p.participantId === user._id,
        );
        console.log("isUserParticipant", isUserParticipant);
        setIsParticipant(isUserParticipant);
        if (!isUserParticipant) {
          toast.error("You must join the room first");
          return;
        }
      } catch (error) {
        toast.error("Room not found or access denied");
        return;
      }

      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        withCredentials: true,
      });

      newSocket.on("connect", () => console.log("Connected to socket"));
      newSocket.on("error", (msg) =>
        toast.error(`Socket error: ${msg.message}`),
      );
      newSocket.on("questionPosted", (question) => {
        console.log("questionPosted", question);
        console.log("questions", questions);
        setQuestions((prev) => [question, ...prev]);
      });
      newSocket.on("updateQuestion", (question) => {
        setQuestions((prev) =>
          prev.map((q) => (q._id === question._id ? question : q)),
        );
      });

      newSocket.on("clearQuestions", () => {
        setQuestions([]);
      });

      setSocket(newSocket);

      // Fetch existing questions
      fetchQuestions(roomId)
        .then(setQuestions)
        .finally(() => setLoading(false));
    };

    checkAccess();

    return () => socket?.disconnect();
  }, [roomId, user, authLoading]);

  const handleAddQuestion = (data) => {
    if (socket) {
      socket.emit("postQuestion", { roomId, question: data.text });
    }
  };

  const handleUpdateQuestion = (id, updates) => {
    if (socket) {
      socket.emit("manageQuestion", { roomId, questionId: id, ...updates });
    }
  };

  const filteredQuestions = questions.filter(
    (q) =>
      (!statusFilter || statusFilter === "All" || q.status === statusFilter) &&
      (!priorityFilter ||
        priorityFilter === "All" ||
        q.priority === priorityFilter),
  );

  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!isParticipant)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Access denied. Please join the room.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" onClick={() => navigate("/")}>
            ← Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Room: {roomId}</h1>
        </div>
        {user.role === "student" && (
          <div className="mb-4">
            <NewQuestionForm onAdd={handleAddQuestion} />
          </div>
        )}
        <div className="mb-4 flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="unanswered">Unanswered</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority:</label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => {
              setStatusFilter("");
              setPriorityFilter("");
            }}
            variant="outline"
          >
            Clear Filters
          </Button>
          {user.role === "faculty" && (
            <Button
              onClick={async () => {
                try {
                  await clearQuestions();
                  setQuestions([]);
                } catch (error) {
                  toast.error("Failed to clear questions");
                }
              }}
              variant="destructive"
            >
              Clear All Questions
            </Button>
          )}
        </div>
        <StickyBoard
          questions={filteredQuestions}
          onUpdate={handleUpdateQuestion}
          userRole={user.role}
        />
      </div>
    </div>
  );
}
