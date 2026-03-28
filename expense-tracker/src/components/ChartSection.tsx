import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  expenseData: { name: string; value: number }[];
  topCategory: string;
};

const COLORS = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444", "#06B6D4"];

export default function ChartSection({ expenseData, topCategory }: Props) {
  const total = expenseData.reduce((acc, curr) => acc + curr.value, 0);

  if (!expenseData || expenseData.length === 0) {
    return (
      <div className="text-center text-gray-400 py-16">
        <p className="text-lg">No expense data</p>
        <p className="text-sm mt-1">Add transactions to see insights 📊</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-300">
          Spending Insights
        </h2>

        <span className="text-sm text-gray-400">
          Top:{" "}
          <span className="text-white font-medium">
            {topCategory}
          </span>
        </span>
      </div>

      {/* CHART */}
      <div className="relative w-full min-h-[320px]">

        {/* ✅ FIX: give fixed height */}
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={expenseData}
              dataKey="value"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={3}
            >
              {expenseData.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* CENTER TEXT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-lg font-semibold">
            ₹{total.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* LEGEND */}
      <div className="mt-6 space-y-2">
        {expenseData.map((item, i) => {
          const percentage = ((item.value / total) * 100).toFixed(0);

          return (
            <div
              key={i}
              className="flex justify-between items-center px-2 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />

                <span className="text-gray-300 text-sm">
                  {item.name}
                </span>
              </div>

              <div className="text-right">
                <p className="text-sm text-white font-medium">
                  ₹{item.value.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-400">
                  {percentage}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}