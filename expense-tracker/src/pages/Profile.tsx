import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  token: string;
};

type User = {
  email: string;
  username: string;
};

type Transaction = {
  amount: number;
};

function Profile({ token }: Props) {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [total, setTotal] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) fetchAll();
  }, [token]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [profileRes, txnRes] = await Promise.all([
        fetch(`${BASE_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const profileData = await profileRes.json();
      const txnData = await txnRes.json();

      // ✅ FIX 1: correct user extraction
      if (profileRes.ok && profileData.success) {
        setUser(profileData.data);
      } else {
        throw new Error("Failed to load profile");
      }

      // ✅ FIX 2: correct transaction extraction
      if (txnRes.ok && txnData.success && Array.isArray(txnData.data)) {
        const transactions = txnData.data;

        const inc = transactions
          .filter((t: Transaction) => t.amount > 0)
          .reduce((a: number, b: Transaction) => a + b.amount, 0);

        const exp = transactions
          .filter((t: Transaction) => t.amount < 0)
          .reduce((a: number, b: Transaction) => a + b.amount, 0);

        setIncome(inc);
        setExpense(Math.abs(exp));
        setTotal(transactions.length);
      } else {
        setIncome(0);
        setExpense(0);
        setTotal(0);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to load profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => navigate("/dashboard");

  // 🔥 LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 🔥 ERROR
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-gray-950">
        <p className="mb-4">{error}</p>
        <button
          onClick={fetchAll}
          className="px-4 py-2 bg-indigo-500 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-[#0B1220] p-6 rounded-2xl border border-gray-800 shadow-lg">

        <h2 className="text-2xl font-semibold mb-6 text-white">
          Profile
        </h2>

        {/* USER INFO */}
        <div className="mb-6 space-y-4">

          <div>
            <p className="text-gray-400 text-sm">Username</p>
            <p className="text-lg text-white font-medium">
              {user?.username}
            </p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="text-lg text-white">
              {user?.email}
            </p>
          </div>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div
            onClick={goToDashboard}
            className="bg-gray-800/70 p-5 rounded-xl cursor-pointer hover:bg-gray-700 transition"
          >
            <p className="text-gray-400 text-sm">Total Transactions</p>
            <h3 className="text-xl font-semibold text-white">
              {total}
            </h3>
          </div>

          <div
            onClick={goToDashboard}
            className="bg-gray-800/70 p-5 rounded-xl cursor-pointer hover:bg-gray-700 transition"
          >
            <p className="text-gray-400 text-sm">Total Income</p>
            <h3 className="text-xl font-semibold text-green-400">
              ₹{income.toLocaleString("en-IN")}
            </h3>
          </div>

          <div
            onClick={goToDashboard}
            className="bg-gray-800/70 p-5 rounded-xl cursor-pointer hover:bg-gray-700 transition"
          >
            <p className="text-gray-400 text-sm">Total Expenses</p>
            <h3 className="text-xl font-semibold text-red-400">
              ₹{expense.toLocaleString("en-IN")}
            </h3>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;