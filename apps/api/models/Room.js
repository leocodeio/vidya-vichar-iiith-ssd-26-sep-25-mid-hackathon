import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomName: { type: String, required: true, trim: true },
  roomId: { type: String, required: true, unique: true },
  createdBy: { type: String, default: "Anonymous" },
  participants: [
    {
      name: { type: String, required: true },
      joinedAt: { type: Date, default: Date.now },
    },
  ],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Room", RoomSchema);
