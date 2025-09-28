// Import necessary React hooks, components, and utilities.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// useAuth is a custom hook to get the current user's authentication status and data.
import { useAuth } from "../context/AuthContext";
// This is the specific API function for joining a room.
import { joinRoom as apiJoinRoom } from "../api";
// A library for showing toast notifications (e.g., for errors or success messages).
import { toast } from "sonner";
// Import reusable UI components.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the JoinRoom component.
export default function JoinRoom() {
  // --- State Management ---
  // State to hold the Room ID entered by the user.
  const [roomId, setRoomId] = useState("");
  // Get the current user object from the authentication context.
  const { user } = useAuth();
  // Initialize the navigate function for programmatic redirection.
  const navigate = useNavigate();

  // --- Event Handlers ---
  // This function is called when the "Join Room" button is clicked.
  const handleJoin = async () => {
    // Validate that the Room ID input is not empty.
    if (!roomId.trim()) {
      toast.error("Please enter a Room ID");
      return; // Stop the function if validation fails.
    }
    // Check if a user is logged in. If not, redirect to the login page.
    if (!user) {
      navigate("/login");
      return;
    }
    // Use a try...catch block to handle potential errors from the API call.
    try {
      // Call the API to add the user as a participant to the specified room.
      await apiJoinRoom({
        roomId,
        name: user.username,
        participantId: user._id,
      });
      // Store the last joined Room ID in the browser's local storage for convenience.
      localStorage.setItem("lastRoomId", roomId);
      // If successful, navigate the user to the room page.
      navigate(`/room/${roomId}`);
    } catch (err) {
      // If the API call fails, show an error notification.
      toast.error(err.response?.data?.error || "Failed to join room");
    }
  };

  // --- Component Render ---
  return (
    // Main container, using flexbox to center the card vertically and horizontally.
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-lime-100 flex items-center justify-center">
      {/* The main card component for the form. */}
      <Card className="w-full max-w-md fade-in">
        <CardHeader>
          <CardTitle>Join Room</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input field for the user to enter the Room ID. */}
          <Input
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)} // Updates the roomId state on every change.
          />
          {/* Container for the action buttons, using flexbox for side-by-side layout. */}
          <div className="flex w-full gap-2">
            {/* The "Back" button. */}
            <Button
              onClick={() => navigate(-1)} // Navigates to the previous page in the browser history.
              variant="outline" // Secondary button style.
              className="flex-1" // Takes up equal space in the flex container.
            >
              Back
            </Button>
            {/* The "Join Room" button. */}
            <Button onClick={handleJoin} className="flex-1"> {/* Calls the handleJoin function on click. */}
              Join Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}