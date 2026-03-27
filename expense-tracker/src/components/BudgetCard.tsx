import { useEffect, useState } from "react";

type BudgetItem = {
category: string;
budget: number | string; // 🔥 backend may send string
spent: number | string;  // 🔥 backend may send string
};

type Props = {
token: string;
refresh: boolean;
};

export default function BudgetCard({ token, refresh }: Props) {
const [data, setData] = useState<BudgetItem[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
if (!token) return;

const fetchData = async () => {
  try {
    const res = await fetch("http://localhost:5000/budget-insights", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const resData = await res.json();

    if (res.ok && resData.success && Array.isArray(resData.data)) {
      setData(resData.data);
    } else if (Array.isArray(resData)) {
      setData(resData);
    } else {
      setData([]);
    }

  } catch (err) {
    console.error("Budget fetch error:", err);
    setData([]);
  } finally {
    setLoading(false);
  }
};

fetchData();

}, [refresh, token]);

return (
<div className="bg-[#0B1220] border border-white/5 rounded-2xl p-6 shadow-sm">

  {/* HEADER */}
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-lg font-semibold text-gray-200">
      Budget Overview
    </h2>
    <span className="text-xs text-gray-500">
      Monthly
    </span>
  </div>

  {/* LOADING */}
  {loading && (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-white/10 rounded w-2/3"></div>
      <div className="h-4 bg-white/10 rounded w-1/2"></div>
    </div>
  )}

  {/* EMPTY */}
  {!loading && data.length === 0 && (
    <p className="text-gray-500 text-sm">
      No budgets set yet
    </p>
  )}

  {/* DATA */}
  {!loading && data.length > 0 && (
    <div className="space-y-5">
      {data.map((item, i) => {
        // ✅ FORCE NUMBER CONVERSION (CRITICAL FIX)
        const budget = Number(item.budget);
        const spent = Number(item.spent);

        const percent =
          budget > 0
            ? Math.min((spent / budget) * 100, 150)
            : 0;

        const isWarning = percent >= 80 && percent < 100;
        const isExceeded = percent >= 100;

        return (
          <div key={i} className="space-y-2">

            {/* HEADER */}
            <div className="flex justify-between items-center text-sm">
              <span className="capitalize text-gray-200 font-medium">
                {item.category}
              </span>
              <span className="text-gray-400">
                ₹{spent} / ₹{budget}
              </span>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isExceeded
                    ? "bg-red-500"
                    : isWarning
                    ? "bg-yellow-400"
                    : "bg-indigo-500"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* STATUS */}
            <div className="text-xs">
              {isExceeded && (
                <span className="text-red-400">
                  🚨 Budget exceeded
                </span>
              )}
              {isWarning && !isExceeded && (
                <span className="text-yellow-400">
                  ⚠️ {Math.round(percent)}% used
                </span>
              )}
              {!isWarning && !isExceeded && (
                <span className="text-gray-500">
                  {Math.round(percent)}% used
                </span>
              )}
            </div>

          </div>
        );
      })}
    </div>
  )}
</div>

);
}