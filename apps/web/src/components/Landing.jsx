import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Landing() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  const handleCreateRoom = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/create-room");
    }
  };

  const handleJoinRoom = () => {
    if (!user) {
      navigate("/login");
    } else {
      navigate("/join-room");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <div></div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarFallback>
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Welcome, {user.username}!</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/signup")}>Sign Up</Button>
            </>
          )}
        </div>
      </header>

      {/* Hero */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="bg-white border-2 border-gray-800 px-16 py-20 text-center min-w-[500px] min-h-[300px] flex flex-col justify-center items-center gap-12">
          <h1 className="text-3xl font-normal text-gray-800 m-0 tracking-wide">
            vidya vichar
          </h1>
          <div className="flex gap-8 justify-center">
            <Button
              variant="outline"
              onClick={handleCreateRoom}
              className="px-6 py-3 text-base"
            >
              create room
            </Button>
            <Button
              variant="outline"
              onClick={handleJoinRoom}
              className="px-6 py-3 text-base"
            >
              join room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
