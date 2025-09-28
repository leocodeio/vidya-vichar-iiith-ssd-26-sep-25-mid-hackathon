// Import necessary React hooks, components, and utilities.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// useAuth is a custom hook to access user authentication state.
import { useAuth } from "../context/AuthContext";
// This is the specific API function for creating a room.
import { createRoom as apiCreateRoom } from "../api";
// A library for showing toast notifications.
import { toast } from "sonner";
// Import reusable UI components from a component library (likely shadcn/ui).
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the CreateRoom component, responsible for the room creation form.
export default function CreateRoom() {
  // --- State Management ---
  // State to hold the name of the room entered by the user.
  const [roomName, setRoomName] = useState("");
  // State to store the unique ID of the room after it's created.
  const [roomId, setRoomId] = useState("");
  // State to control the visibility of the success dialog.
  const [open, setOpen] = useState(false);
  // Get the current user object from the authentication context.
  const { user } = useAuth();
  // Initialize the navigate function for programmatic redirection.
  const navigate = useNavigate();

  // --- Event Handlers ---

  // Handles the logic when the "Create Room" button is clicked.
  const handleCreate = async () => {
    // 1. Validation: Ensure the room name is not empty.
    if (!roomName.trim()) {
      toast.error("Room name cannot be empty");
      return; // Stop the function if validation fails.
    }
    // 2. Authorization: Check if the user is logged in and has the 'faculty' role.
    if (!user || user.role !== "faculty") {
      toast.error("Only faculty can create rooms");
      return;
    }
    // 3. API Call: Use a try...catch block to handle the asynchronous API request.
    try {
      const data = await apiCreateRoom({
        roomName,
        creatorName: user.username,
        creatorId: user._id,
      });
      // On success, update the state with the new room ID.
      setRoomId(data.roomId);
      // Store the last created room ID in local storage for convenience.
      localStorage.setItem("lastRoomId", data.roomId);
      // Open the success dialog.
      setOpen(true);
    } catch (error) {
      // If the API call fails, show an error notification.
      toast.error("Failed to create room");
    }
  };

  // Navigates the user to the newly created room page.
  const handleContinue = () => {
    navigate(`/room/${roomId}`);
  };

  // Copies the created Room ID to the user's clipboard.
  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied!");
  };

  // --- Component Render ---

  return (
    // Main container, using flexbox to center the card on the screen.
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-100 flex items-center justify-center">
      {/* The main card component for the form. */}
      <Card className="w-full max-w-md fade-in">
        <CardHeader>
          <CardTitle>Create Room</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input field for the room name, controlled by the roomName state. */}
          <Input
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          {/* Container for the action buttons, using flexbox for layout. */}
          <div className="flex w-full gap-2">
            {/* The "Back" button navigates to the previous page in history. */}
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            {/* The "Create Room" button triggers the handleCreate function. */}
            <Button onClick={handleCreate} className="flex-1">
              Create Room
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog: This is only visible when the 'open' state is true. */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Created</DialogTitle>
          </DialogHeader>
          {/* Content of the dialog, showing the new room ID and actions. */}
          <div className="space-y-4">
            <p>Your Room ID is:</p>
            {/* Displays the generated room ID. */}
            <div className="p-2 bg-slate-100 rounded font-mono text-center">
              {roomId}
            </div>
            {/* Buttons for copying the ID or proceeding to the room. */}
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                Copy ID
              </Button>
              <Button onClick={handleContinue} className="flex-1">
                Continue to Room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}