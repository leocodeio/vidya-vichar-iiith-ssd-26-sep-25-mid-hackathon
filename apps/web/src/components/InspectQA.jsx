// Import necessary React hooks, components, and utilities.
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Custom hook for authentication
import { fetchQuestions } from "../api"; // API function to get questions
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner"; // For showing notifications

// Define the InspectQA component for TAs and faculty to review questions.
export default function InspectQA() {
  // --- State Management ---
  const [roomId, setRoomId] = useState(""); // Stores the ID of the room to inspect.
  const [questions, setQuestions] = useState([]); // Stores the original, unfiltered list of questions from the API.
  const [filteredQuestions, setFilteredQuestions] = useState([]); // Stores the questions after applying filters.
  const [loading, setLoading] = useState(false); // Manages the loading state for fetching data.
  const [currentPage, setCurrentPage] = useState(1); // Tracks the current page for pagination.
  const [statusFilter, setStatusFilter] = useState("all"); // Stores the selected status filter.
  const [priorityFilter, setPriorityFilter] = useState("all"); // Stores the selected priority filter.
  const [searchText, setSearchText] = useState(""); // Stores the text for searching questions.
  const { user, loading: authLoading } = useAuth(); // Gets the current user and auth loading status.
  const navigate = useNavigate(); // Hook for programmatic navigation.

  // --- Constants ---
  const pageSize = 10; // Number of questions to display per page.

  // --- Data Fetching ---
  // Fetches questions for the specified roomId from the API.
  const handleFetch = async () => {
    if (!roomId.trim()) {
      toast.error("Please enter a room ID");
      return;
    }
    setLoading(true);
    try {
      const data = await fetchQuestions(roomId.trim());
      if (data.length === 0) {
        toast.error("No questions found for this room");
        // Clear previous results if any
        setQuestions([]);
        setFilteredQuestions([]);
        return;
      }
      setQuestions(data); // Store the original fetched data.
      setFilteredQuestions(data); // Initialize filtered list with all fetched data.
      setCurrentPage(1); // Reset to the first page on new fetch.
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  // --- Filtering Logic ---
  // This useEffect hook runs whenever filters or the base `questions` array change.
  // It applies all active filters to generate the `filteredQuestions` array.
  useEffect(() => {
    let filtered = [...questions]; // Start with a copy of all questions.

    // Apply status filter if it's not 'all'.
    if (statusFilter !== "all") {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }

    // Apply priority filter if it's not 'all'.
    if (priorityFilter !== "all") {
      filtered = filtered.filter((q) => q.priority === priorityFilter);
    }

    // Apply search filter if there is search text.
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.text.toLowerCase().includes(search) ||
          q.author.toLowerCase().includes(search) ||
          (q.answer && q.answer.toLowerCase().includes(search)) // Check if answer exists before searching it
      );
    }

    setFilteredQuestions(filtered); // Update the state with the filtered results.
    setCurrentPage(1); // Reset to the first page whenever filters change.
  }, [statusFilter, priorityFilter, searchText, questions]);

  // --- Utility Functions ---
  // Exports the currently filtered questions to a CSV file.
  const exportToCSV = () => {
    if (filteredQuestions.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ["Question", "Author", "Status", "Answer", "Priority", "Created At"];
    // Map each question object to a CSV row, handling quotes and commas.
    const csvContent = [
      headers.join(","),
      ...filteredQuestions.map((q) =>
        [
          `"${q.text.replace(/"/g, '""')}"`, // Enclose in quotes and escape existing quotes.
          `"${q.author}"`,
          q.status,
          `"${(q.answer || "").replace(/"/g, '""')}"`,
          q.priority,
          new Date(q.createdAt).toLocaleString(),
        ].join(",")
      ),
    ].join("\n");

    // Create a Blob and trigger a download link.
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `questions_${roomId}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Derived State for Rendering ---
  // Calculates the questions to be displayed on the current page.
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  // Calculates the total number of pages needed for pagination.
  const totalPages = Math.ceil(filteredQuestions.length / pageSize);

  // --- Authorization Guard ---
  // If the user is not a TA or faculty, or if auth is still loading, deny access.
  if (authLoading) {
    return <div>Loading...</div>; // Show loading state while checking auth
  }
  if (user?.role !== "ta" && user?.role !== "faculty") {
    return <div>Access denied</div>;
  }

  // --- Component Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Inspect Q/A</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>

        {/* Room ID Input Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Enter Room ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleFetch} disabled={loading}>
                {loading ? "Fetching..." : "Fetch Questions"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* This entire section (filters and table) only renders after questions have been fetched at least once. */}
        {questions.length > 0 && (
          <>
            {/* Filters Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 flex-wrap">
                  {/* Status Filter Dropdown */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="unanswered">Unanswered</SelectItem>
                      <SelectItem value="answered">Answered</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Priority Filter Dropdown */}
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Search Input */}
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      type="text"
                      placeholder="Search questions, authors, answers..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>

                  {/* Export Button */}
                  <div className="flex items-end">
                    <Button onClick={exportToCSV} variant="outline">
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions Table Card */}
            <Card>
              <CardHeader>
                <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {/* Table to display questions */}
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    {/* Table headers */}
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">Question</th>
                        <th className="border border-gray-300 p-2 text-left">Author</th>
                        <th className="border border-gray-300 p-2 text-left">Status</th>
                        <th className="border border-gray-300 p-2 text-left">Answer</th>
                        <th className="border border-gray-300 p-2 text-left">Priority</th>
                        <th className="border border-gray-300 p-2 text-left">Created At</th>
                      </tr>
                    </thead>
                    {/* Table body */}
                    <tbody>
                      {paginatedQuestions.map((q) => (
                        <tr key={q._id} className="hover:bg-gray-50 border-b">
                          <td className="border border-gray-300 p-2">{q.text}</td>
                          <td className="border border-gray-300 p-2">{q.author}</td>
                          <td className="border border-gray-300 p-2 capitalize">{q.status}</td>
                          <td className="border border-gray-300 p-2">{q.answer || "-"}</td>
                          <td className="border border-gray-300 p-2 capitalize">{q.priority}</td>
                          <td className="border border-gray-300 p-2">{new Date(q.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}