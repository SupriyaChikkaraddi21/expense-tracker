import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState } from "react";
import type { ReactNode } from "react";

import AuthForm from "./components/AuthForm";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Landing from "./pages/Landing";
import Navbar from "./components/Navbar";

/* ---------- ROOT ---------- */
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

/* ---------- PROTECTED ROUTE ---------- */
function ProtectedRoute({
  token,
  children,
}: {
  token: string | null;
  children: ReactNode;
}) {
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

/* ---------- MAIN APP ---------- */
function AppContent() {
  // ✅ FIXED: load token BEFORE render (no useEffect nonsense)
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const location = useLocation();

  const handleAuth = (t: string) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // ✅ Navbar visibility
  const showNavbar =
    !!token &&
    (location.pathname.startsWith("/dashboard") ||
      location.pathname.startsWith("/profile"));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {showNavbar && <Navbar onLogout={logout} />}

      <Routes>
        {/* LANDING */}
        <Route
          path="/"
          element={
            token ? <Navigate to="/dashboard" replace /> : <Landing />
          }
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthForm onAuth={handleAuth} />
            )
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute token={token}>
              <Dashboard token={token!} />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute token={token}>
              <Profile token={token!} />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;