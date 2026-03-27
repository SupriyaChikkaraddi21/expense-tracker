import { useState, useEffect } from "react";

type Transaction = {
  id: number;
  text: string;
  amount: number;
  category: string;
  created_at?: string;
};

type Category = {
  id: number;
  name: string;
};

export const useTransactions = (token: string, filterType: string) => {
  const BASE_URL = "http://localhost:5000";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [month, setMonth] = useState("all");

  // ------------------------
  // LOAD TRANSACTIONS
  // ------------------------
  const loadTransactions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const resData = await res.json();

      if (res.ok && resData.success && Array.isArray(resData.data)) {
        setTransactions(resData.data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Transactions fetch error:", err);
      setTransactions([]);
    }
  };

  // ------------------------
  // LOAD CATEGORIES
  // ------------------------
  const loadCategories = async () => {
    try {
      const res = await fetch(`${BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const resData = await res.json();

      if (res.ok && resData.success && Array.isArray(resData.data)) {
        setCategories(resData.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Categories fetch error:", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    if (token) {
      loadTransactions();
      loadCategories();
    }
  }, [token]);

  // ------------------------
  // ADD TRANSACTION
  // ------------------------
  const addTransaction = async (body: any) => {
    setLoading(true);
    try {
      const formattedBody = {
        ...body,
        amount:
          body.type === "expense"
            ? -Math.abs(body.amount)
            : Math.abs(body.amount),
        category: body.category.trim().toLowerCase(), // ✅ normalize
      };

      const res = await fetch(`${BASE_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedBody),
      });

      const resData = await res.json();

      if (!res.ok || !resData.success) {
        console.error("Add failed:", resData);
        return;
      }

      await loadTransactions();
    } catch (err) {
      console.error("Add error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // UPDATE
  // ------------------------
  const updateTransaction = async (id: number, body: any) => {
    setLoading(true);
    try {
      const formattedBody = {
        ...body,
        amount:
          body.amount < 0
            ? -Math.abs(body.amount)
            : Math.abs(body.amount),
        category: body.category.trim().toLowerCase(), // ✅ normalize
      };

      await fetch(`${BASE_URL}/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedBody),
      });

      await loadTransactions();
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // DELETE
  // ------------------------
  const deleteTransaction = async (id: number) => {
    await fetch(`${BASE_URL}/transactions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    loadTransactions();
  };

  // ------------------------
  // FILTERS
  // ------------------------
  let filtered = [...transactions];

  if (filterType === "income") {
    filtered = filtered.filter((t) => t.amount > 0);
  } else if (filterType === "expense") {
    filtered = filtered.filter((t) => t.amount < 0);
  }

  const finalTransactions = filtered.filter((t) => {
    const matchCategory =
      categoryFilter === "All" ||
      t.category.toLowerCase() === categoryFilter.toLowerCase();

    const matchSearch = t.text
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchMonth =
      month === "all" ||
      (t.created_at &&
        new Date(t.created_at).getMonth().toString() === month);

    return matchCategory && matchSearch && matchMonth;
  });

  // ------------------------
  // CALCULATIONS
  // ------------------------
  const income = finalTransactions
    .filter((t) => t.amount > 0)
    .reduce((a, b) => a + b.amount, 0);

  const expense = finalTransactions
    .filter((t) => t.amount < 0)
    .reduce((a, b) => a + b.amount, 0);

  const balance = income + expense;

  // ------------------------
  // 🔥 FIXED CHART DATA (MAIN BUG FIX)
  // ------------------------
  const expenseData = finalTransactions
    .filter((t) => t.amount < 0)
    .reduce((acc: { name: string; value: number }[], curr) => {
      const normalizedCategory = curr.category.trim().toLowerCase();

      const existing = acc.find(
        (i) => i.name === normalizedCategory
      );

      if (existing) {
        existing.value += Math.abs(curr.amount);
      } else {
        acc.push({
          name: normalizedCategory,
          value: Math.abs(curr.amount),
        });
      }

      return acc;
    }, []);

  const topCategory =
    expenseData.length > 0
      ? [...expenseData].sort((a, b) => b.value - a.value)[0].name
      : "N/A";

  return {
    transactions: finalTransactions,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loading,
    loadCategories,

    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    month,
    setMonth,

    income,
    expense,
    balance,
    expenseData,
    topCategory,
  };
};