export const detectCategory = (text: string) => {
  const t = text.toLowerCase();

  if (t.includes("food") || t.includes("zomato") || t.includes("swiggy")) return "Food";
  if (t.includes("uber") || t.includes("bus") || t.includes("travel")) return "Travel";
  if (t.includes("movie") || t.includes("netflix")) return "Entertainment";
  if (t.includes("salary")) return "Salary";
  if (t.includes("shopping") || t.includes("amazon")) return "Shopping";

  return "";
};