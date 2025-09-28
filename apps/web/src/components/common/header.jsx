import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export default function Header(){
      const { user, logout, loading } = useAuth();
      const navigate = useNavigate();
    if(loading){
        return <>Loading</>
    }
    return <>
         {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b">
       <h1 className="text-2xl font-extrabold tracking-wide text-black">
  VidyaVichar
</h1>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="outline" size="sm" onClick={logout}>
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
              <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </header>
</>
}