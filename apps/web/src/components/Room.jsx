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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Grid, List } from "lucide-react";

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
  const [viewType, setViewType] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const SidebarContent = () => (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Room: {roomId}</h1>

      {user.role === "student" && (
        <div>
          <NewQuestionForm onAdd={handleAddQuestion} />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
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
            <SelectTrigger className="w-full">
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
          className="w-full"
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
            className="w-full"
          >
            Clear All Questions
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-200">
      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-80 min-h-screen bg-white shadow-lg">
          <SidebarContent />
        </div>

        {/* Mobile Sheet Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <div className="lg:hidden">
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="fixed top-4 left-4 z-40"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          </div>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Controls</SheetTitle>
              <SheetDescription>Manage questions and filters</SheetDescription>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:pl-0">
          {/* Header with Back Button and View Toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="lg:hidden" /> {/* Spacer for mobile menu button */}
            <Button variant="outline" onClick={() => navigate("/")}>
              ← Back to Home
            </Button>
            <div className="flex gap-2">
              <Button
                variant={viewType === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewType("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewType === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewType("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Questions Board */}
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
            <StickyBoard
              questions={filteredQuestions}
              onUpdate={handleUpdateQuestion}
              userRole={user.role}
              viewType={viewType}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
