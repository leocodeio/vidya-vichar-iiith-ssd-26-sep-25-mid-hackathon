import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { joinRoom as apiJoinRoom } from "../api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function JoinRoom() {
  const [roomId, setRoomId] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!roomId.trim()) {
      toast.error("Please enter a Room ID");
      return;
    }
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await apiJoinRoom({
        roomId,
        name: user.username,
        participantId: user._id,
      });
      localStorage.setItem("lastRoomId", roomId);
      navigate(`/room/${roomId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to join room");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-lime-100 flex items-center justify-center">
      <Card className="w-full max-w-md fade-in">
        <CardHeader>
          <CardTitle>Join Room</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          {/* --- START: UPDATED CODE --- */}
          <div className="flex w-full gap-2">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            <Button onClick={handleJoin} className="flex-1">
              Join Room
            </Button>
          </div>
          {/* --- END: UPDATED CODE --- */}
        </CardContent>
      </Card>
    </div>
  );
}