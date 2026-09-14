import { apiFetch, firstRow, asList } from "~/utils/apiFetch";

const expenseBody = (payload: Record<string, any>) => {
  const body: Record<string, any> = {
    categoryId: payload.categoryId ?? payload.category_id,
    amount: Number(payload.amount),
    expenseDate: payload.expenseDate ?? payload.expense_date,
  };

  if (payload.branchId || payload.branch_id) {
    body.branchId = payload.branchId ?? payload.branch_id;
  }

  if (payload.description != null && payload.description !== "") {
    body.description = payload.description;
  }

  return body;
};

export const expenseService = {
  async getCategories(params: Record<string, any> = {}) {
    return asList(await apiFetch("/expense-categories", { method: "GET", params }));
  },

  async createCategory(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/expense-categories", {
        method: "POST",
        body: { name: payload.name },
      }),
    );
  },

  async updateCategory(id: string, payload: Record<string, any>) {
    const body: Record<string, any> = {};
    if (payload.name != null) body.name = payload.name;
    if (payload.status) body.status = payload.status;
    return firstRow(
      await apiFetch(`/expense-categories/${id}`, {
        method: "PATCH",
        body,
      }),
    );
  },

  async getExpenses(params: Record<string, any> = {}) {
    return asList(await apiFetch("/expenses", { method: "GET", params }));
  },

  async getExpense(id: string) {
    return firstRow(await apiFetch(`/expenses/${id}`, { method: "GET" }));
  },

  async createExpense(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/expenses", {
        method: "POST",
        body: expenseBody(payload),
      }),
    );
  },

  async updateExpense(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/expenses/${id}`, {
        method: "PATCH",
        body: expenseBody(payload),
      }),
    );
  },
};
