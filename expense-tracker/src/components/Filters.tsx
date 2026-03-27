import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Filters({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  month,
  setMonth,
  categories,
}: any) {
  const [catOpen, setCatOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);

  // ✅ CRITICAL FIX
  const safeCategories = Array.isArray(categories) ? categories : [];

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* TITLE */}
      <h2 className="text-lg font-semibold text-gray-300">
        Filters
      </h2>

      {/* SEARCH */}
      <div>
        <label className="text-xs text-gray-400 mb-1 block">
          Search
        </label>
        <input
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl 
          focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* CATEGORY */}
      <div className="relative">
        <label className="text-xs text-gray-400 mb-1 block">
          Category
        </label>

        <button
          onClick={() => {
            setCatOpen(!catOpen);
            setMonthOpen(false);
          }}
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-left flex justify-between items-center"
        >
          <span>
            {categoryFilter === "All" || !categoryFilter
              ? "All Categories"
              : categoryFilter}
          </span>

          <span className={`text-sm transition ${catOpen ? "rotate-180" : ""}`}>
            ⌄
          </span>
        </button>

        <AnimatePresence>
          {catOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute z-50 mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto"
            >
              <div
                onClick={() => {
                  setCategoryFilter("All");
                  setCatOpen(false);
                }}
                className="p-3 hover:bg-gray-800 cursor-pointer text-gray-300"
              >
                All Categories
              </div>

              {/* ✅ SAFE MAP */}
              {safeCategories.map((c: any) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setCategoryFilter(c.name);
                    setCatOpen(false);
                  }}
                  className="p-3 hover:bg-gray-800 cursor-pointer text-gray-300"
                >
                  {c.name}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MONTH */}
      <div className="relative">
        <label className="text-xs text-gray-400 mb-1 block">
          Month
        </label>

        <button
          onClick={() => {
            setMonthOpen(!monthOpen);
            setCatOpen(false);
          }}
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-left flex justify-between items-center"
        >
          <span>
            {month === "all"
              ? "All Months"
              : months[Number(month)] || "All Months"} {/* ✅ SAFE */}
          </span>

          <span className={`text-sm transition ${monthOpen ? "rotate-180" : ""}`}>
            ⌄
          </span>
        </button>

        <AnimatePresence>
          {monthOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute z-50 mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-lg"
            >
              <div
                onClick={() => {
                  setMonth("all");
                  setMonthOpen(false);
                }}
                className="p-3 hover:bg-gray-800 cursor-pointer text-gray-300"
              >
                All Months
              </div>

              {months.map((m, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setMonth(i.toString());
                    setMonthOpen(false);
                  }}
                  className="p-3 hover:bg-gray-800 cursor-pointer text-gray-300"
                >
                  {m}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}