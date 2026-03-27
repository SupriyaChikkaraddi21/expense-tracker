import { motion } from "framer-motion";

export default function SummaryCards({ transactions }: any) {

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const income = transactions
    .filter((t: any) => t.amount > 0)
    .reduce((a: number, b: any) => a + b.amount, 0);

  const expense = transactions
    .filter((t: any) => t.amount < 0)
    .reduce((a: number, b: any) => a + b.amount, 0);

  const balance = income + expense;

  const cards = [
    {
      label: "Income",
      value: income,
      color: "text-green-400",
      icon: "↑",
    },
    {
      label: "Expenses",
      value: Math.abs(expense),
      color: "text-red-400",
      icon: "↓",
    },
    {
      label: "Balance",
      value: balance,
      color: balance >= 0 ? "text-indigo-400" : "text-red-400",
      icon: "₹",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className="bg-[#111827] border border-gray-800 p-6 rounded-2xl flex flex-col justify-between"
        >

          {/* TOP */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-400">
              {card.label}
            </p>

            <span className="text-gray-500 text-sm">
              {card.icon}
            </span>
          </div>

          {/* VALUE */}
          <h2 className={`text-2xl md:text-3xl font-semibold ${card.color}`}>
            {formatINR(card.value)}
          </h2>

          {/* SUBTEXT */}
          <p className="text-xs text-gray-500 mt-2">
            {card.label === "Balance"
              ? balance >= 0
                ? "You are saving money"
                : "You are overspending"
              : card.label === "Income"
              ? "Total earnings"
              : "Total spent"}
          </p>

        </motion.div>
      ))}

    </div>
  );
}