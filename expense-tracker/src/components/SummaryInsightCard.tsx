import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

type SummaryData = {
  totalSpent: number;
  topCategory: string;
};

type Props = {
  token: string;
  month: number; // ✅ NEW
};

export default function SummaryInsightCard({ token, month }: Props) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchSummary = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/summary?month=${month}`, // ✅ UPDATED
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const resData = await res.json();

        if (res.ok && resData.success && resData.data) {
          setData(resData.data);
        } else {
          setData(null);
        }
      } catch (err) {
        console.error("Summary error:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [token, month]); // ✅ IMPORTANT

  return (
    <div className="bg-gradient-to-br from-[#0B1220] to-[#020617] border border-white/5 rounded-2xl p-6 shadow-md">

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧠</span>
        <h2 className="text-lg font-semibold text-gray-200">
          Smart Spending Insights(this month) (
          {new Date(0, month).toLocaleString("default", { month: "long" })}
          )
        </h2>
      </div>

      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-2/3"></div>
        </div>
      )}

      {!loading && !data && (
        <p className="text-gray-400 text-sm">
          No summary available.
        </p>
      )}

      {!loading && data && (
        <div className="space-y-4">

          <p className="text-2xl font-bold text-indigo-400">
            ₹{data.totalSpent.toLocaleString("en-IN")}
          </p>

          <div className="flex gap-6 text-xs text-gray-400 pt-2 border-t border-white/5">

            <div>
              <p className="uppercase text-[10px] text-gray-500">
                Total Spent
              </p>
              <p className="text-gray-200 font-medium">
                ₹{data.totalSpent.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="uppercase text-[10px] text-gray-500">
                Top Category
              </p>
              <p className="text-gray-200 font-medium capitalize">
                {data.topCategory}
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}