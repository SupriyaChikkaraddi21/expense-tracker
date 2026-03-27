import { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function BudgetForm({ token, categories, onAdded }: any) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!category || !amount) return;

    try {
      await fetch(`${BASE_URL}/budgets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: category.trim().toLowerCase(),
          amount: Number(amount),
          month,
          year,
        }),
      });

      setCategory("");
      setAmount("");

      onAdded();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#111827] p-5 rounded-2xl border border-gray-800">
      <h2 className="text-lg font-semibold mb-4 text-gray-300">
        Set Budget
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl"
        >
          <option value="">Select Category</option>

          {/* ✅ FIXED */}
          {(Array.isArray(categories) ? categories : []).map((c: any) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Budget amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl"
        />

        <div className="grid grid-cols-2 gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="p-3 bg-gray-800 border border-gray-700 rounded-xl"
          >
            {[
              "Jan","Feb","Mar","Apr","May","Jun",
              "Jul","Aug","Sep","Oct","Nov","Dec"
            ].map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="p-3 bg-gray-800 border border-gray-700 rounded-xl"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 py-2 rounded-xl font-semibold"
        >
          Save Budget
        </button>
      </form>
    </div>
  );
}