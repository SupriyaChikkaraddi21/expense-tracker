function groupByCategory(transactions) {
  const map = {};

  transactions.forEach((t) => {
    if (t.type === "expense") {
      map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
    }
  });

  return map;
}

function generateInsights(transactions) {
  const now = new Date();
  const currentMonth = selectedMonth ?? now.getMonth();
  const currentYear = now.getFullYear();

  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonth = prevMonthDate.getMonth();
  const prevYear = prevMonthDate.getFullYear();

  // ✅ Current month filter
  const current = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // ✅ Previous month filter
  const previous = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const currCat = groupByCategory(current);
  const prevCat = groupByCategory(previous);

  const insights = [];

  // 🔥 Category comparison
  Object.keys(currCat).forEach((cat) => {
    const curr = currCat[cat];
    const prev = prevCat[cat] || 0;

    if (prev === 0 && curr > 0) {
      insights.push({
        type: "info",
        message: `${cat} spending started this month`,
      });
    } else {
      const diff = curr - prev;

      if (Math.abs(diff) > 100) {
        const percent = ((diff / (prev || 1)) * 100).toFixed(0);

        insights.push({
          type: diff > 0 ? "danger" : "info",
          message: `${cat} spending ${
            diff > 0 ? "increased" : "decreased"
          } by ${Math.abs(percent)}%`,
        });
      }
    }
  });

  // 🔥 Top category
  const sorted = Object.entries(currCat).sort((a, b) => b[1] - a[1]);

  if (sorted.length > 0) {
    insights.push({
      type: "highlight",
      message: `Highest spending in ${sorted[0][0]}`,
    });
  }

  return insights.slice(0, 3);
}

module.exports = { generateInsights };