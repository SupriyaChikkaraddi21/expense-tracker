import { motion } from "framer-motion";
import { useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import TransactionForm from "../components/TransactionsForm";
import TransactionList from "../components/TransactionList";
import SummaryCards from "../components/SummaryCards";
import ChartSection from "../components/ChartSection";
import Filters from "../components/Filters";
import InsightsCard from "../components/InsightsCard";
import BudgetCard from "../components/BudgetCard";
import BudgetForm from "../components/BudgetForm";
import TrendsCard from "../components/TrendsCard";
import PredictionCard from "../components/PredictionCard";
import MonthlyBarChart from "../components/MonthlyBarChart";
import SummaryInsightCard from "../components/SummaryInsightCard";
import { useLocation } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL;

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

function Dashboard({ token}: any) {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const type = query.get("type") ??""; // "income" | "expense" | null
  const {
    transactions,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loading,
    expenseData,
    topCategory,
    loadCategories,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    month,
    setMonth,
  } = useTransactions(token, type);

  const [editing, setEditing] = useState<any>(null);
  const [refreshBudget, setRefreshBudget] = useState(false);

  const handleBudgetAdded = () => {
    setRefreshBudget((prev) => !prev);
  };

  const handleSubmit = (data: any) => {
    if (editing) {
      updateTransaction(editing.id, data);
      setEditing(null);
    } else {
      addTransaction(data);
    }
  };
  

  const downloadCSV = async () => {
    try {
      const res = await fetch(`${BASE_URL}/export-csv`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "transactions.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV download failed:", err);
      alert("Failed to download CSV");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-100">
              💰 Expense Tracker
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Track, analyze and optimize your spending
            </p>
          </div>

          <button
            onClick={downloadCSV}
            className="bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 rounded-xl text-sm font-medium"
          >
            ⬇ Export CSV
          </button>
        </div>

        <motion.div {...fadeUp}>
          <SummaryCards transactions={transactions} />
        </motion.div>

        <motion.div {...fadeUp}>
          <SummaryInsightCard token={token} />
        </motion.div>

        <motion.div {...fadeUp}>
          <InsightsCard token={token} />
        </motion.div>

        {/* TOP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div {...fadeUp}>
            <BudgetCard token={token} refresh={refreshBudget} />
          </motion.div>

          <motion.div {...fadeUp}>
            <TrendsCard token={token} />
          </motion.div>

          <motion.div {...fadeUp} className="lg:col-span-2">
            <MonthlyBarChart token={token} />
          </motion.div>

          <motion.div {...fadeUp} className="lg:col-span-2">
            <PredictionCard token={token} />
          </motion.div>
        </div>

        {/* MAIN SECTION */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT SIDE */}
          <div className="w-full lg:w-[320px] flex flex-col gap-6">

            <motion.div
              {...fadeUp}
              className="bg-[#0B1220] border border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold mb-4 text-gray-200">
                {editing ? "Edit Transaction" : "Add Transaction"}
              </h2>

              <TransactionForm
                categories={categories}
                onSubmit={handleSubmit}
                loading={loading}
                token={token}
                refreshCategories={loadCategories}
                editing={editing}
                setEditing={setEditing}
              />
            </motion.div>

            <motion.div
              {...fadeUp}
              className="bg-[#0B1220] border border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-lg transition"
            >
              <Filters
                search={search}
                setSearch={setSearch}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                month={month}
                setMonth={setMonth}
                categories={categories}
              />
            </motion.div>

            <motion.div {...fadeUp}>
              <BudgetForm
                token={token}
                categories={categories}
                onAdded={handleBudgetAdded}
              />
            </motion.div>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex-1 flex flex-col gap-6">

            {/* ✅ FIXED TRANSACTIONS */}
            <motion.div
              {...fadeUp}
              className="bg-[#0B1220] border border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-lg transition w-full overflow-hidden"
            >
              <h2 className="text-lg font-semibold mb-4 text-gray-200">
                Transactions
              </h2>

              {/* 🔥 SCROLL FIX */}
              <div className="max-h-[420px] overflow-y-auto pr-2">
                <TransactionList
                  transactions={transactions}
                  onDelete={deleteTransaction}
                  onEdit={setEditing}
                />
              </div>
            </motion.div>

            {/* CHART */}
            <motion.div
              {...fadeUp}
              className="bg-[#0B1220] border border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold mb-6 text-gray-200">
                Spending Insights
              </h2>

              <div className="w-full flex justify-center">
                <div className="w-full max-w-[420px]">
                  <ChartSection
                    expenseData={expenseData}
                    topCategory={topCategory}
                  />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;