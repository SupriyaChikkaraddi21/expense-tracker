const BASE_URL = import.meta.env.VITE_API_URL;

export const getTransactions = async () => {
  const res = await fetch(`${BASE_URL}/transactions`);
  return res.json();
};

export const addTransaction = async (data: any) => {
  const res = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteTransaction = async (id: number) => {
  await fetch(`${BASE_URL}/transactions/${id}`, {
    method: "DELETE",
  });
};