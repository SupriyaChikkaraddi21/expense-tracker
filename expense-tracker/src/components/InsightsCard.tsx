import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

type Insight = {
  type: "danger" | "warning" | "info" | "highlight";
  message: string;
};

type Props = {
  token: string;
};

export default function InsightsCard({ token }: Props) {
  const [data, setData] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchInsights = async () => {
      try {
        const res = await fetch(`${BASE_URL}/insights`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const resData = await res.json();

        if (res.ok && resData.success && Array.isArray(resData.data)) {
          setData(resData.data);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Insights fetch error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [token]);

  const styles = {
    danger: "bg-red-500/10 border-red-500/20 text-red-400",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    highlight: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  };

  const icons = {
    danger: "🚨",
    warning: "⚠️",
    info: "📊",
    highlight: "✨",
  };

  return (
    <div className="bg-[#0B1220] border border-white/5 rounded-2xl p-6 shadow-sm">

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-200">
          Smart Insights
        </h2>
        <span className="text-xs text-gray-500">
          AI Analysis
        </span>
      </div>

      {loading && (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-4 bg-white/10 rounded w-2/3"></div>
          <div className="h-4 bg-white/10 rounded w-1/3"></div>
        </div>
      )}

      {!loading && data.length === 0 && (
        <p className="text-gray-500 text-sm">
          No insights yet. Add transactions to unlock analysis.
        </p>
      )}

      {!loading && data.length > 0 && (
        <div className="space-y-3">
          {data.map((item, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-4 rounded-xl border transition hover:bg-white/5 ${styles[item.type]}`}
            >
              <span className="text-lg mt-[2px]">
                {icons[item.type]}
              </span>

              <div className="flex-1">
                <p className="text-sm leading-relaxed text-gray-200">
                  {item.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}