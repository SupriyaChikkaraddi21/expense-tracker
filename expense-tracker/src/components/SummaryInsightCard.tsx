import { useEffect, useState } from "react";

type SummaryData = {
  totalSpent: number;
  topCategory: string;
};

type Props = {
  token: string;
};

export default function SummaryInsightCard({ token }: Props) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchSummary = async () => {
      try {
        const res = await fetch("http://localhost:5000/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const resData = await res.json();

        // ✅ FIX: access correct level
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
  }, [token]);

  return (
    <div className="bg-gradient-to-br from-[#0B1220] to-[#020617] border border-white/5 rounded-2xl p-6 shadow-md">

      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🧠</span>
        <h2 className="text-lg font-semibold text-gray-200">
          AI Spending Summary
        </h2>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-2/3"></div>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !data && (
        <p className="text-gray-400 text-sm">
          No summary available.
        </p>
      )}

      {/* CONTENT */}
      {!loading && data && (
        <div className="space-y-4">

          {/* TOTAL */}
          <p className="text-2xl font-bold text-indigo-400">
            ₹{data.totalSpent.toLocaleString("en-IN")}
          </p>

          {/* EXTRA INFO */}
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