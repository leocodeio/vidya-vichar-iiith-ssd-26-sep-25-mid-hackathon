import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    navigate("/create-room");
  };

  const handleJoinRoom = () => {
    navigate("/join-room");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="bg-white border-2 border-gray-800 px-16 py-20 text-center min-w-[500px] min-h-[300px] flex flex-col justify-center items-center gap-12">
        <h1 className="text-3xl font-normal text-gray-800 m-0 tracking-wide">
          vidya vichar
        </h1>
        <div className="flex gap-8 justify-center">
          <button
            className="bg-white border border-gray-800 px-6 py-3 text-base text-gray-800 cursor-pointer transition-all duration-200 tracking-wide hover:bg-gray-50 active:bg-gray-100"
            onClick={handleCreateRoom}
          >
            create room
          </button>
          <button
            className="bg-white border border-gray-800 px-6 py-3 text-base text-gray-800 cursor-pointer transition-all duration-200 tracking-wide hover:bg-gray-50 active:bg-gray-100"
            onClick={handleJoinRoom}
          >
            join room
          </button>
        </div>
      </div>
    </div>
  );
}
