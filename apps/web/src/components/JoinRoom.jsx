import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { joinRoom as apiJoinRoom } from "../api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function JoinRoom() {
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setError("");
    try {
      await apiJoinRoom({ roomId, name: user.username });
      navigate(`/room/${roomId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to join room");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Room</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          {error && <p className="text-red-500">{error}</p>}
          <Button onClick={handleJoin} className="w-full">
            Join Room
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
