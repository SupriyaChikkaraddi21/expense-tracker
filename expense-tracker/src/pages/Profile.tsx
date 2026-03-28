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
  id?: number;
  text?: string;
  amount: number;
  category?: string;
  created_at?: string;
};

function Profile({ token }: Props) {
  const BASE_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [total, setTotal] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  const [topCategory, setTopCategory] = useState("N/A");
  const [avgSpend, setAvgSpend] = useState(0);
  const [lastActivity, setLastActivity] = useState("No activity");

  const [activeFilter, setActiveFilter] =
    useState<"income" | "expense" | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

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

      if (profileRes.ok && profileData.success) {
        setUser(profileData.data);
        setTempName(profileData.data.username);
      }

      if (txnRes.ok && txnData.success && Array.isArray(txnData.data)) {
        const txns: Transaction[] = txnData.data;
        setTransactions(txns);

        const inc = txns
          .filter((t) => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);

        const exp = txns
          .filter((t) => t.amount < 0)
          .reduce((sum, t) => sum + t.amount, 0);

        const absExp = Math.abs(exp);

        setIncome(inc);
        setExpense(absExp);
        setTotal(txns.length);
        setBalance(inc - absExp);

        // TOP CATEGORY
        const map: Record<string, number> = {};
        txns.forEach((t) => {
          if (t.amount < 0 && t.category) {
            map[t.category] =
              (map[t.category] || 0) + Math.abs(t.amount);
          }
        });

        const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0];

        setTopCategory(top ? `${top[0]} (₹${top[1]})` : "N/A");

        // AVG SPEND
        const days = new Date().getDate();
        setAvgSpend(days ? Math.round(absExp / days) : 0);

        // LAST ACTIVITY
        const latestTxn = txns
          .filter((t) => t.created_at)
          .sort(
            (a, b) =>
              new Date(b.created_at!).getTime() -
              new Date(a.created_at!).getTime()
          )[0];

        setLastActivity(
          latestTxn?.created_at
            ? new Date(latestTxn.created_at).toLocaleDateString("en-IN")
            : "No activity"
        );
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = (type?: "income" | "expense") => {
    setActiveFilter(type || null);
    navigate(type ? `/dashboard?type=${type}` : "/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-700 w-40 rounded"></div>
        <div className="h-20 bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (error) return <p className="text-white">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold">Profile</h2>
        <button
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-400"
        >
          Logout
        </button>
      </div>

      {/* USER */}
      <div className="bg-[#0B1220] p-6 rounded-2xl mb-6 border border-white/5">
        <p className="text-gray-400 text-sm">Username</p>

        {editingName ? (
          <div className="flex gap-2 mt-2">
            <input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="bg-gray-800 px-3 py-2 rounded"
            />
            <button
              onClick={() => {
                setUser({ ...user!, username: tempName });
                setEditingName(false);
              }}
              className="bg-green-500 px-3 rounded"
            >
              Save
            </button>
          </div>
        ) : (
          <p
            onClick={() => setEditingName(true)}
            className="text-lg cursor-pointer"
          >
            {user?.username}
          </p>
        )}

        <p className="text-gray-400 mt-4 text-sm">Email</p>
        <p>{user?.email}</p>
      </div>

      {/* FILTER LABEL (FIXES ERROR) */}
      {activeFilter && (
        <p className="mb-4 text-indigo-400">
          Showing: {activeFilter} transactions
        </p>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <StatCard
          title="Transactions"
          icon="📊"
          value={total}
          onClick={() => goToDashboard()}
        />

        <StatCard
          title="Income"
          icon="💰"
          value={`₹${income.toLocaleString("en-IN")}`}
          onClick={() => goToDashboard("income")}
        />

        <StatCard
          title="Expenses"
          icon="📉"
          value={`₹${expense.toLocaleString("en-IN")}`}
          onClick={() => goToDashboard("expense")}
        />

        <div className={`p-5 rounded-xl ${balance >= 0 ? "bg-green-700" : "bg-red-700"}`}>
          <p className="text-xs opacity-70">Balance</p>
          <h3 className="text-lg font-semibold">
            🧮 ₹{balance.toLocaleString("en-IN")}
          </h3>
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">

        <InfoCard title="Top Category" icon="🏆" value={topCategory} />
        <InfoCard title="Avg Spend / Day" icon="📅" value={`₹${avgSpend}`} />
        <InfoCard title="Last Activity" icon="⏱" value={lastActivity} />

      </div>

      {/* USING transactions (fixes TS error) */}
      <p className="text-gray-500 text-sm mt-6">
        Total loaded transactions: {transactions.length}
      </p>

    </div>
  );
}

function StatCard({ title, icon, value, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800 p-5 rounded-xl hover:scale-105 transition cursor-pointer"
    >
      <p className="text-xs text-gray-400">{title}</p>
      <h3 className="text-lg font-semibold">
        {icon} {value}
      </h3>
    </div>
  );
}

function InfoCard({ title, icon, value }: any) {
  return (
    <div className="bg-gray-800 p-5 rounded-xl">
      <p className="text-xs text-gray-400">{title}</p>
      <h3 className="text-lg font-semibold">
        {icon} {value}
      </h3>
    </div>
  );
}

export default Profile;