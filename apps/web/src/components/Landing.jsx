import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  const handleCreateRoom = () => {
    // This check is good practice, though the button is hidden
    if (user?.role !== "faculty") return; 
    navigate("/create-room");
  };

  const handleJoinRoom = () => {
    if (!user) navigate("/login");
    else navigate("/join-room");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Hero Section */}
      <main className="flex flex-1 items-center justify-center px-6 text-center">
        <div className="max-w-xl flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Stay connected. Learn together.
          </h2>
          <p className="text-gray-600">
            A collaborative platform where students, TAs, and faculty come together 
            to create rooms, share knowledge, and inspect discussions.
          </p>

          {/* Role-based actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {/* Create Room: Faculty only */}
            {user?.role === "faculty" && (
              <Button variant="default" onClick={handleCreateRoom}>
                Create Room
              </Button>
            )}

            {/* Join Room: Student and Faculty */}
            {(user?.role === "student" || user?.role === "faculty") && (
              <Button variant="outline" onClick={handleJoinRoom}>
                Join Room
              </Button>
            )}

            {/* Inspect Q/A: TA and Faculty */}
            {(user?.role === "ta" || user?.role === "faculty") && (
              <Button variant="secondary" onClick={() => navigate("/inspect-qa")}>
                Inspect Q/A
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-600 border-t bg-gray-100">
        <p className="mb-2">
          Made with ❤️ by{" "}
          <span className="font-medium text-gray-800">
            Harsha · Teja · Ankit · Rohit · Krish
          </span>
        </p>
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Vidya Vichar. All rights reserved.
        </p>
      </footer>
    </div>
  );
}