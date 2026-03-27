import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

type Trend = {
  category: string;
  current: number;
  previous: number;
  percent: number | string;
  trend: "up" | "down" | "neutral" | "new";
};

type Props = {
  token: string;
};

export default function TrendsCard({ token }: Props) {
  const [data, setData] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchTrends = async () => {
      try {
        const res = await fetch(`${BASE_URL}/spending-trends`, {
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
        console.error("Trends fetch error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [token]);

  return (
    <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">

      <h2 className="text-lg font-semibold mb-4 text-gray-300">
        Monthly Trends
      </h2>

      {loading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      )}

      {!loading && data.length === 0 && (
        <p className="text-gray-400">No trend data</p>
      )}

      {!loading && data.length > 0 && (
        <div className="space-y-3">
          {data.map((item, i) => {
            const percent = Number(item.percent) || 0;

            return (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-[#1F2937] rounded-lg"
              >
                <div>
                  <p className="text-sm capitalize">
                    {item.category}
                  </p>
                  <p className="text-xs text-gray-400">
                    ₹{item.previous} → ₹{item.current}
                  </p>
                </div>

                <div className="text-sm font-semibold">
                  {item.trend === "new" && (
                    <span className="text-yellow-400">
                      New spending
                    </span>
                  )}

                  {item.trend === "up" && (
                    <span className="text-red-400">
                      ↑ {Math.abs(percent)}%
                    </span>
                  )}

                  {item.trend === "down" && (
                    <span className="text-green-400">
                      ↓ {Math.abs(percent)}%
                    </span>
                  )}

                  {item.trend === "neutral" && (
                    <span className="text-gray-400">
                      No change
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