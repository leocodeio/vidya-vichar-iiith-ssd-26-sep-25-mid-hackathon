// React hooks for state and side-effects
import { useState, useEffect } from "react";
// React Router hooks for accessing params and navigation
import { useParams, useNavigate } from "react-router-dom";
// Socket.IO client for real-time communication
import { io } from "socket.io-client";
// Authentication context to access user info
import { useAuth } from "../context/AuthContext";
// API functions for fetching and managing questions, showing room info
import { fetchQuestions, clearQuestions, showRoom } from "../api";
// Toast notifications for user feedback
import { toast } from "sonner";
// Custom components
import StickyBoard from "./ref/StickyBoard"; // Board to display questions
import NewQuestionForm from "./ref/NewQuestionForm"; // Form for posting new questions

// UI components from design system
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
} from "@/components/ui/sheet";
import { Menu, Grid, List, Copy, Check } from "lucide-react"; // Icons

// URL for Socket.IO server
const SOCKET_URL = "http://localhost:3001";

// Main Room component
export default function Room() {
  const navigate = useNavigate(); // Hook to navigate programmatically
  const { roomId } = useParams(); // Get roomId from URL params

  // Local state
  const [copied, setCopied] = useState(false); // State for copy icon feedback
  const { user, loading: authLoading } = useAuth(); // Authenticated user and auth loading state
  const [questions, setQuestions] = useState([]); // Array of questions in the room
  const [socket, setSocket] = useState(null); // Socket connection
  const [statusFilter, setStatusFilter] = useState(""); // Filter for question status
  const [priorityFilter, setPriorityFilter] = useState(""); // Filter for question priority
  const [isParticipant, setIsParticipant] = useState(false); // Whether user is participant
  const [loading, setLoading] = useState(true); // Local loading state for data
  const [viewType, setViewType] = useState("grid"); // View type for questions: grid or list
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar visibility

  // Effect runs when roomId, user, or authLoading changes
  useEffect(() => {
    console.log("user", user);
    if (authLoading) return; // Wait until auth is loaded
    if (!user) navigate("/"); // Redirect to home if not logged in

    // Async function to check room access and initialize socket
    const checkAccess = async () => {
      try {
        const room = await showRoom(roomId); // Fetch room info
        console.log("room", room);
        // Check if user is a participant
        const isUserParticipant = room.participants.some(
          (p) => p.participantId === user._id,
        );
        console.log("isUserParticipant", isUserParticipant);
        setIsParticipant(isUserParticipant);

        if (!isUserParticipant) {
          // Show error if not a participant
          toast.error("You must join the room first");
          return;
        }
      } catch (error) {
        // Handle error if room not found or access denied
        toast.error("Room not found or access denied");
        return;
      }

      // Extract JWT token from cookies for socket authentication
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      // Initialize socket connection
      const newSocket = io(SOCKET_URL, {
        auth: { token }, // Send token for server auth
        withCredentials: true, // Send cookies
      });

      // Socket event listeners
      newSocket.on("connect", () => console.log("Connected to socket"));
      newSocket.on("error", (msg) =>
        toast.error(`Socket error: ${msg.message}`),
      );
      // Event when a new question is posted
      newSocket.on("questionPosted", (question) => {
        console.log("questionPosted", question);
        console.log("questions", questions);
        setQuestions((prev) => [question, ...prev]); // Add new question to top
      });
      // Event when a question is updated
      newSocket.on("updateQuestion", (question) => {
        setQuestions((prev) =>
          prev.map((q) => (q._id === question._id ? question : q)),
        ); // Replace updated question
      });
      // Event when all questions are cleared
      newSocket.on("clearQuestions", () => {
        setQuestions([]); // Empty questions array
      });

      setSocket(newSocket); // Save socket instance to state

      // Fetch existing questions from API
      fetchQuestions(roomId)
        .then(setQuestions)
        .finally(() => setLoading(false)); // Stop loading once data fetched
    };

    checkAccess(); // Call async function

    // Cleanup socket connection on unmount
    return () => socket?.disconnect();
  }, [roomId, user, authLoading]);

  // Function to handle posting new question
  const handleAddQuestion = (data) => {
    if (socket) {
      socket.emit("postQuestion", { roomId, question: data.text });
    }
  };

  // Function to handle updating a question
  const handleUpdateQuestion = (id, updates) => {
    if (socket) {
      socket.emit("manageQuestion", { roomId, questionId: id, ...updates });
    }
  };

  // Filter questions based on selected filters
  const filteredQuestions = questions.filter(
    (q) =>
      (!statusFilter || statusFilter === "All" || q.status === statusFilter) &&
      (!priorityFilter ||
        priorityFilter === "All" ||
        q.priority === priorityFilter),
  );

  // Show loading state while auth or data is loading
  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  // Show access denied if user is not a participant
  if (!isParticipant)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Access denied. Please join the room.
      </div>
    );

  // Sidebar content component
  const SidebarContent = () => (
    <div className="p-4 space-y-4">
      {/* Room ID header with copy button */}
      <h1 className="text-2xl font-bold mb-4">
        Room: {roomId}{" "}
        <button
          onClick={() => {
            navigator.clipboard.writeText(roomId); // Copy roomId to clipboard
            setCopied(true); // Show copied icon
            setTimeout(() => setCopied(false), 2000); // Reset after 2s
          }}
          className="ml-2 p-1 text-black rounded "
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </h1>

      {/* Show form to add new question if user is a student */}
      {user.role === "student" && (
        <div>
          <NewQuestionForm onAdd={handleAddQuestion} />
        </div>
      )}

      {/* Filters and controls */}
      <div className="space-y-4">
        {/* Status filter */}
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

        {/* Priority filter */}
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

        {/* Button to clear filters */}
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

        {/* Faculty-only button to clear all questions */}
        {user.role === "faculty" && (
          <Button
            onClick={async () => {
              try {
                await clearQuestions(); // API call to clear questions
                setQuestions([]); // Clear local state
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

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-200">
      {/* Collapsible Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle>Room Controls</SheetTitle>
            <SheetDescription>
              Manage questions and filters for Room {roomId}
            </SheetDescription>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {/* Header with Hamburger Menu, Back Button, and View Toggle */}
        <div className="flex justify-between items-center mb-6">
          {/* Left - Hamburger Menu Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="flex-shrink-0"
            title="Open Menu"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Center - Back to Home Button */}
          <Button variant="outline" onClick={() => navigate("/")}>
            ← Back to Home
          </Button>

          {/* Right - View Toggle */}
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant={viewType === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewType("grid")}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewType("list")}
              title="List View"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Questions Board */}
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
          <StickyBoard
            questions={filteredQuestions} // Questions to display
            onUpdate={handleUpdateQuestion} // Callback for updating questions
            userRole={user.role} // User role to control permissions
            viewType={viewType} // Display type: grid or list
          />
        </div>
      </div>
    </div>
  );
}
