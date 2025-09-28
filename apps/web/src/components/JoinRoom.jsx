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
    if (!user) {
      navigate("/login");
      return;
    }
    console.log(roomId, user);
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
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <Button onClick={handleJoin} className="w-full">
            Join Room
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
