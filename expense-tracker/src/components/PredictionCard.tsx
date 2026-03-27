import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function PredictionCard({ token }: any) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    fetch(`${BASE_URL}/budget-predictions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [token]);

  return (
    <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-300">
        Budget Prediction
      </h2>

      {data.length === 0 && (
        <p className="text-gray-400">No prediction data</p>
      )}

      <div className="space-y-3">
        {data.map((item, i) => {
          if (item.status === "exceeded") {
            return (
              <p key={i} className="text-red-400 text-sm">
                ❌ {item.category} budget exceeded
              </p>
            );
          }

          if (item.status === "no_data") {
            return (
              <p key={i} className="text-gray-400 text-sm">
                ⚪ No data for {item.category}
              </p>
            );
          }

          return (
            <p key={i} className="text-yellow-400 text-sm">
              ⚠ {item.category}: budget may run out in{" "}
              <b>{item.daysLeft} days</b>
            </p>
          );
        })}
      </div>
    </div>
  );
}