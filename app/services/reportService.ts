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

export type DailyReportSection =
  | "summary"
  | "sales"
  | "reservations"
  | "delivered"
  | "cancelled"
  | "received"
  | "stockOut"
  | "allMovements"
  | "returns"
  | "exchanges";

export const reportService = {
  /**
   * Daily report — all filters go as query params:
   * ?from=&to=&branchId=&productId=&section=
   */
  async getDailyReport(
    params: Record<string, any> = {},
    section: DailyReportSection = "summary",
  ) {
    return asData(
      await apiFetch("/reports/daily", {
        method: "GET",
        params: {
          ...todayRange(),
          ...params,
          section: section || "summary",
        },
      }),
    );
  },

  async getDailyReportSection(
    section: Exclude<DailyReportSection, "summary">,
    params: Record<string, any> = {},
  ) {
    return this.getDailyReport(params, section);
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
