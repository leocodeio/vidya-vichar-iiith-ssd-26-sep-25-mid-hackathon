import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchQuestions } from "../api";
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
import { toast } from "sonner";

export default function InspectQA() {
  const [roomId, setRoomId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const pageSize = 10;

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
        return;
      }
      setQuestions(data);
      setFilteredQuestions(data); // initialize with fetched data
      setCurrentPage(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever the filters or questions change
  useEffect(() => {
    let filtered = [...questions]; // Copy original questions to avoid mutating the state directly

    if (statusFilter !== "all") {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((q) => q.priority === priorityFilter);
    }

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.text.toLowerCase().includes(search) ||
          q.author.toLowerCase().includes(search) ||
          q.answer.toLowerCase().includes(search)
      );
    }

    setFilteredQuestions(filtered);
    setCurrentPage(1); // Reset to the first page after filter change
  }, [statusFilter, priorityFilter, searchText, questions]);

  const exportToCSV = () => {
    const headers = [
      "Question",
      "Author",
      "Status",
      "Answer",
      "Priority",
      "Created At",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredQuestions.map((q) =>
        [
          `"${q.text.replace(/"/g, '""')}"`,
          `"${q.author}"`,
          q.status,
          `"${q.answer.replace(/"/g, '""')}"`,
          q.priority,
          new Date(q.createdAt).toLocaleString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `questions_${roomId}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredQuestions.length / pageSize);

  if ((user?.role !== "ta" && user?.role !== "faculty") || authLoading) {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Inspect Q/A</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>

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

        {questions.length > 0 && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 flex-wrap">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => setStatusFilter(value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="unanswered">Unanswered</SelectItem>
                        <SelectItem value="answered">Answered</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Priority
                    </label>
                    <Select
                      value={priorityFilter}
                      onValueChange={(value) => setPriorityFilter(value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="important">Important</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Search
                    </label>
                    <Input
                      type="text"
                      placeholder="Search questions, authors, answers..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={exportToCSV} variant="outline">
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">
                          Question
                        </th>
                        <th className="border border-gray-300 p-2 text-left">
                          Author
                        </th>
                        <th className="border border-gray-300 p-2 text-left">
                          Status
                        </th>
                        <th className="border border-gray-300 p-2 text-left">
                          Answer
                        </th>
                        <th className="border border-gray-300 p-2 text-left">
                          Priority
                        </th>
                        <th className="border border-gray-300 p-2 text-left">
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedQuestions.map((q) => (
                        <tr key={q._id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-2">
                            {q.text}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {q.author}
                          </td>
                          <td className="border border-gray-300 p-2 capitalize">
                            {q.status}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {q.answer || "-"}
                          </td>
                          <td className="border border-gray-300 p-2 capitalize">
                            {q.priority}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {new Date(q.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
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
