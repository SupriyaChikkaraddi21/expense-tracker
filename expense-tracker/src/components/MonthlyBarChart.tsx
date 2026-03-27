import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Props = {
  token: string;
};

type DataType = {
  month: string;
  amount: number;
};

export default function MonthlyBarChart({ token }: Props) {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/monthly-comparison", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const resData = await res.json();

        // ✅ FIX: normalize response
        if (res.ok && resData.success && Array.isArray(resData.data)) {
          setData(resData.data);
        } else if (Array.isArray(resData)) {
          setData(resData); // fallback
        } else {
          setData([]);
        }

      } catch (err) {
        console.error("Chart fetch error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="bg-gradient-to-br from-[#0B1220] to-[#0F172A] p-6 rounded-2xl border border-gray-800 shadow-xl">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-200">
          Monthly Spending
        </h2>
        <span className="text-xs text-gray-400">
          This year
        </span>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="h-[280px] flex items-center justify-center text-gray-500">
          Loading chart...
        </div>
      )}

      {/* EMPTY */}
      {!loading && data.length === 0 && (
        <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">
          No data available
        </div>
      )}

      {/* CHART */}
      {!loading && data.length > 0 && (
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap={30}>

              <CartesianGrid
                stroke="#1e293b"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                stroke="#64748B"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{ fill: "rgba(99,102,241,0.08)" }}
                formatter={(value: any) =>
                  [`₹${Number(value).toLocaleString("en-IN")}`, "Spending"]
                }
                labelStyle={{ color: "#94A3B8" }}
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: "10px",
                  color: "#fff",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                }}
              />

              <Bar
                dataKey="amount"
                radius={[10, 10, 0, 0]}
                fill="#6366F1"
                barSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}