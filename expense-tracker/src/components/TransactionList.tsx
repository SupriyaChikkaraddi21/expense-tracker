export default function TransactionList({
  transactions,
  onDelete,
  onEdit,
}: any) {

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  if (!transactions.length) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-lg">No transactions yet</p>
        <p className="text-sm mt-1">Start by adding your first expense 🚀</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((t: any) => {
        const isIncome = t.amount > 0;

        return (
          <div
            key={t.id}
            className="flex justify-between items-center p-4 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-750 transition"
          >

            {/* LEFT */}
            <div className="flex flex-col">
              <p className="font-medium text-white">{t.text}</p>

              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <span className="bg-gray-700 px-2 py-[2px] rounded-md text-[10px] uppercase tracking-wide">
                  {t.category}
                </span>

                <span>
                  {t.created_at
                    ? new Date(t.created_at).toLocaleDateString()
                    : ""}
                </span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">

              {/* AMOUNT */}
              <span
                className={`font-semibold text-sm ${
                  isIncome ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatINR(t.amount)}
              </span>

              {/* ACTIONS */}
              <div className="flex items-center gap-2">

                <button
                  onClick={() => onEdit(t)}
                  className="text-yellow-400 hover:text-yellow-300 transition text-sm"
                >
                  ✏️
                </button>

                <button
                  onClick={() => onDelete(t.id)}
                  className="text-red-400 hover:text-red-300 transition text-sm"
                >
                  ✕
                </button>

              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}