import { apiFetch, asData, asList } from "~/utils/apiFetch";

const todayRange = () => {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
};

export const reportService = {
  async getDailyReport(params: Record<string, any> = {}) {
    const range = {
      ...todayRange(),
      ...params,
    };
    return asData(
      await apiFetch("/reports/daily", { method: "GET", params: range }),
    );
  },

  async getSalesReport(params: Record<string, any> = {}) {
    return asList(await apiFetch("/reports/sales", { method: "GET", params }));
  },

  async getReservationReport(params: Record<string, any> = {}) {
    return asList(
      await apiFetch("/reports/reservations", { method: "GET", params }),
    );
  },

  async getInventoryReport(params: Record<string, any> = {}) {
    return asList(
      await apiFetch("/reports/inventory", { method: "GET", params }),
    );
  },

  async getStockMovementsReport(params: Record<string, any> = {}) {
    return asList(
      await apiFetch("/reports/stock-movements", { method: "GET", params }),
    );
  },

  async getExpensesReport(params: Record<string, any> = {}) {
    return asList(
      await apiFetch("/reports/expenses", { method: "GET", params }),
    );
  },
};
