import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { detectCategory } from "../utils/autoCategory";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function TransactionForm({
  categories,
  onSubmit,
  loading,
  token,
  refreshCategories,
  editing,
  setEditing
}: any) {

  const [text, setText] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [newCategory, setNewCategory] = useState("");
  const [open, setOpen] = useState(false);

  // ✅ CRITICAL FIX
  const safeCategories = Array.isArray(categories) ? categories : [];

  useEffect(() => {
    if (editing) {
      setText(editing.text);
      setAmount(String(Math.abs(editing.amount)));
      setCategory(editing.category);
      setType(editing.amount > 0 ? "income" : "expense");
    }
  }, [editing]);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (!e.target.closest(".category-dropdown")) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSubmit = () => {
    if (!text || !amount || !category) return;

    const finalAmount =
      type === "expense"
        ? -Math.abs(Number(amount))
        : Math.abs(Number(amount));

    onSubmit({
      text,
      amount: finalAmount,
      category,
      date: new Date().toISOString().split("T")[0],
      type,
    });

    setText("");
    setAmount("");
    setCategory("");
    setEditing(null);
  };

  const handleAddCategory = async () => {
    if (!newCategory) return;

    await fetch(`${BASE_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newCategory }),
    });

    setCategory(newCategory);
    setNewCategory("");
    refreshCategories && refreshCategories(); // ✅ safe
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >

      <div className="flex bg-gray-800 p-1 rounded-xl">
        <button
          onClick={() => setType("expense")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            type === "expense"
              ? "bg-red-500 text-white"
              : "text-gray-400 hover:bg-gray-700"
          }`}
        >
          Expense
        </button>

        <button
          onClick={() => setType("income")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            type === "income"
              ? "bg-green-500 text-white"
              : "text-gray-400 hover:bg-gray-700"
          }`}
        >
          Income
        </button>
      </div>

      <input
        placeholder="What did you spend on?"
        value={text}
        onChange={(e) => {
          const val = e.target.value;
          setText(val);

          const detected = detectCategory(val);
          if (detected) setCategory(detected);
        }}
        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <input
        type="number"
        placeholder="Amount (₹)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <div className="relative category-dropdown">
        <label className="text-sm text-gray-400 mb-1 block">
          Category
        </label>

        <div
          onClick={() => setOpen(!open)}
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl cursor-pointer flex justify-between items-center hover:bg-gray-700 transition"
        >
          <span className={category ? "text-white" : "text-gray-400"}>
            {category || "Select Category"}
          </span>

          <span className={`transition ${open ? "rotate-180" : ""}`}>
            ⌄
          </span>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute w-full mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50"
          >
            {safeCategories.length === 0 && (
              <p className="p-3 text-gray-400 text-sm">
                No categories
              </p>
            )}

            {safeCategories.map((c: any) => (
              <div
                key={c.id}
                onClick={() => {
                  setCategory(c.name);
                  setOpen(false);
                }}
                className="p-3 text-gray-300 hover:bg-gray-800 cursor-pointer transition"
              >
                {c.name}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          placeholder="New category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-xl"
        />

        <button
          onClick={handleAddCategory}
          className="bg-green-500 px-4 rounded-xl hover:scale-105 transition"
        >
          +
        </button>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-indigo-500 hover:bg-indigo-600 p-3 rounded-xl font-semibold transition"
      >
        {loading
          ? "Processing..."
          : editing
          ? "Update Transaction"
          : "Add Transaction"}
      </button>

      {editing && (
        <button
          onClick={() => {
            setEditing(null);
            setText("");
            setAmount("");
            setCategory("");
          }}
          className="w-full text-gray-400 hover:text-white transition text-sm"
        >
          Cancel Edit
        </button>
      )}
    </motion.div>
  );
}