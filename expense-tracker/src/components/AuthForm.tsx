import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

type Props = {
  onAuth: (token: string) => void;
};

function AuthForm({ onAuth }: Props) {
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_API_URL; // ✅ FIXED

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email || !password || (!isLogin && !username)) {
      return "All fields are required";
    }
    if (!email.includes("@")) return "Invalid email";
    if (password.length < 5) return "Password too short";
    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const endpoint = isLogin ? "login" : "register";

      const res = await fetch(`${BASE_URL}/${endpoint}`, { // ✅ FIXED
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          username,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Auth failed");
        return;
      }

      if (data?.data?.token) {
        console.log("TOKEN RECEIVED:", data.data.token);
        onAuth(data.data.token);
        navigate("/dashboard");
      } else {
        setError("No token received");
      }

    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="bg-white/5 backdrop-blur-xl p-8 rounded-2xl w-[360px] border border-white/10 shadow-2xl">

        <h2 className="text-2xl font-semibold text-center mb-6 text-white">
          {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            className="w-full p-3 mb-4 rounded-lg bg-white/10 text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-lg bg-white/10 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded-lg bg-white/10 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 py-3 rounded-lg"
        >
          {loading ? "Processing..." : isLogin ? "Login" : "Register"}
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {/* GOOGLE LOGIN */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                if (!credentialResponse.credential) {
                  setError("No credential");
                  return;
                }

                setLoading(true);

                const res = await fetch(`${BASE_URL}/google-auth`, { // ✅ FIXED
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    credential: credentialResponse.credential,
                  }),
                });

                const data = await res.json();

                if (!res.ok || !data.success) {
                  setError(data.message || "Google failed");
                  return;
                }

                if (data?.data?.token) {
                  console.log("GOOGLE TOKEN:", data.data.token);
                  onAuth(data.data.token);
                  navigate("/dashboard");
                } else {
                  setError("No token from Google");
                }

              } catch (err) {
                console.error(err);
                setError("Google auth error");
              } finally {
                setLoading(false);
              }
            }}
            onError={() => setError("Google Login Failed")}
          />
        </div>

        <p
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
          }}
          className="text-center text-gray-400 mt-5 cursor-pointer"
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

export default AuthForm;