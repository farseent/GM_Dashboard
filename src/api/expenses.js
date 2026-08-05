import api from './axios'


// ==============================
// EXPENSES
// ==============================

export const getExpense = async () => {
  const { data } = await api.get("/expense");
  return data;
};

export const createExpense = async (payload) => {
  const { data } = await api.post("/expense", payload);
  return data;
};

// ==============================
// EXPENSE CATEGORIES
// ==============================

export const getExpenseCategories = async () => {
  const { data } = await api.get("/expense/category");
  return data;
};

export const createExpenseCategory = async (categoryData) => {
  const { data } = await api.post(
    "/expense/category",
    categoryData
  );
  return data;
};


// ==============================
// BRANCHES / FRANCHISES
// ==============================

/**
 * @param {"Branch" | "Franchise"} type
 */
export const getExpenseLocations = async (type) => {
  const { data } = await api.get(`/expense/locations/${type}`);
  return data;
};

