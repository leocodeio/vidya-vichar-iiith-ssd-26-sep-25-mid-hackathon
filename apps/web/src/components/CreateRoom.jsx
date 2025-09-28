import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createRoom as apiCreateRoom } from "../api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!user || user.role !== "faculty") {
      toast.error("Only faculty can create rooms");
      return;
    }
    try {
      const data = await apiCreateRoom({
        roomName,
        creatorName: user.username,
        creatorId: user._id,
      });
      setRoomId(data.roomId);
      localStorage.setItem("lastRoomId", data.roomId);
      setOpen(true);
    } catch (error) {
      toast.error("Failed to create room");
    }
  };

  const handleContinue = () => {
    navigate(`/room/${roomId}`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-100 flex items-center justify-center">
      <Card className="w-full max-w-md fade-in">
        <CardHeader>
          <CardTitle>Create Room</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <Button onClick={handleCreate} className="w-full">
            Create Room
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Created</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Room ID: {roomId}</p>
            <Button onClick={copyToClipboard} variant="outline">
              Copy Room ID
            </Button>
            <Button onClick={handleContinue}>Continue to Room</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
