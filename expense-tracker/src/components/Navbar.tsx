import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

type Props = {
  onLogout: () => void;
};

type User = {
  username: string;
};

function Navbar({ onLogout }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    fetch("http://localhost:5000/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => {});
  }, []);

  return (
    <div className="flex justify-between items-center bg-[#0B1220]/80 backdrop-blur-md px-6 py-4 rounded-xl mb-6 border border-white/10 shadow-lg">
      
      {/* LOGO */}
      <h1
        onClick={() => navigate("/dashboard")}
        className="text-xl font-semibold cursor-pointer text-white tracking-wide hover:opacity-80 transition"
      >
        ExpenseIQ
      </h1>

      {/* NAV LINKS */}
      <div className="flex items-center gap-6">

        <button
          onClick={() => navigate("/dashboard")}
          className={`text-sm transition ${
            isActive("/dashboard")
              ? "text-indigo-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/profile")}
          className={`text-sm transition ${
            isActive("/profile")
              ? "text-indigo-400"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Profile
        </button>

        {/* USERNAME */}
        <div className="text-sm text-gray-300 hidden sm:block">
          {user ? (
            <span className="bg-white/5 px-3 py-1 rounded-lg">
              @{user.username}
            </span>
          ) : (
            <span className="opacity-50">...</span>
          )}
        </div>

        {/* LOGOUT */}
        <button
          onClick={onLogout}
          className="bg-red-500/80 hover:bg-red-500 px-4 py-2 rounded-lg text-sm transition shadow"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;