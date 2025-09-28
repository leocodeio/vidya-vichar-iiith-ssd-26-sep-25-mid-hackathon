import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Landing from "./components/Landing";
import CreateRoom from "./components/CreateRoom";
import JoinRoom from "./components/JoinRoom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Room from "./components/Room";
import InspectQA from "./components/InspectQA";
import "./App.css";
import Header from "./components/common/header";

export default function App() {
  
  return (
    <AuthProvider>
      <Router>
      <Header/>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/create-room" element={<CreateRoom />} />
          <Route path="/join-room" element={<JoinRoom />} />
          <Route path="/room/:roomId" element={<Room />} />
          <Route path="/inspect-qa" element={<InspectQA />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
