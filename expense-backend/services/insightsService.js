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
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonth = prevMonthDate.getMonth();
  const prevYear = prevMonthDate.getFullYear();

  const current = transactions.filter((t) => {
    const d = new Date(t.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const previous = transactions.filter((t) => {
    const d = new Date(t.created_at);
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
      insights.push(`${cat} spending started this month`);
    } else {
      const diff = curr - prev;

      if (Math.abs(diff) > 100) {
        const percent = ((diff / (prev || 1)) * 100).toFixed(0);

        insights.push(
          `${cat} spending ${
            diff > 0 ? "increased" : "decreased"
          } by ${Math.abs(percent)}%`
        );
      }
    }
  });

  // 🔥 Top category
  const sorted = Object.entries(currCat).sort((a, b) => b[1] - a[1]);

  if (sorted.length > 0) {
    insights.push(`Highest spending in ${sorted[0][0]}`);
  }

  return insights.slice(0, 3); // limit
}

module.exports = { generateInsights };