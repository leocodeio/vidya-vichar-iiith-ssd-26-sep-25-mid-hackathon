// Import necessary hooks and components.
// useNavigate is used for programmatic navigation (e.g., redirecting after a button click).
import { useNavigate } from "react-router-dom";
// useAuth is a custom hook to access user authentication state (like user info and loading status).
import { useAuth } from "../context/AuthContext";
// Button is a reusable UI component for creating buttons.
import { Button } from "./ui/button";

// Define the Landing page component, which is the main entry point for users.
export default function Landing() {
  // Initialize the navigate function from React Router for redirection.
  const navigate = useNavigate();
  // Destructure user data and loading status from the authentication context.
  const { user, loading } = useAuth();

  // If the authentication status is still being checked, display a simple loading message.
  // This prevents rendering the page with incomplete user data.
  if (loading) return <div>Loading...</div>;

  // --- Event Handlers ---

  // Handles the click event for the "Create Room" button.
  const handleCreateRoom = () => {
    // A security check to ensure only faculty can proceed, even though the button is hidden for others.
    if (user?.role !== "faculty") return;
    // Navigates the faculty user to the room creation page.
    navigate("/create-room");
  };

  // Handles the click event for the "Join Room" button.
  const handleJoinRoom = () => {
    // If no user is logged in, redirect to the login page.
    if (!user) navigate("/login");
    // Otherwise, navigate the logged-in user to the page for joining a room.
    else navigate("/join-room");
  };

  // --- Component Render ---

  return (
    // Main container for the landing page, using flexbox for layout.
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Main content section, centered on the page. */}
      <main className="flex flex-1 items-center justify-center px-6 text-center">
        {/* Container for the hero text content. */}
        <div className="max-w-xl flex flex-col gap-6">
          {/* Main heading of the page. */}
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Stay connected. Learn together.
          </h2>
          {/* A brief description of the platform. */}
          <p className="text-gray-600">
            A collaborative platform where students, TAs, and faculty come together
            to create rooms, share knowledge, and inspect discussions.
          </p>

          {/* This section contains action buttons that are conditionally rendered based on the user's role. */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {/* "Create Room" button is only visible to users with the 'faculty' role. */}
            {user?.role === "faculty" && (
              <Button variant="default" onClick={handleCreateRoom}>
                Create Room
              </Button>
            )}

            {/* "Join Room" button is visible to both 'student' and 'faculty' roles. */}
            {(user?.role === "student" || user?.role === "faculty") && (
              <Button variant="outline" onClick={handleJoinRoom}>
                Join Room
              </Button>
            )}

            {/* "Inspect Q/A" button is visible to both 'ta' (Teaching Assistant) and 'faculty' roles. */}
            {(user?.role === "ta" || user?.role === "faculty") && (
              <Button variant="secondary" onClick={() => navigate("/inspect-qa")}>
                Inspect Q/A
              </Button>
            )}
          </div>
        </div>
      </main>

      {/* Footer section of the page. */}
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