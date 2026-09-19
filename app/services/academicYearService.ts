import { apiFetch, apiFetchBlob, firstRow, asList } from "~/utils/apiFetch";

export type AcademicYearExportParams = {
  format?: "xlsx";
  branchId?: string;
  from?: string;
  to?: string;
};

const academicYearBody = (payload: Record<string, any>) => {
  const body: Record<string, any> = {};

  if (payload.name != null) body.name = String(payload.name).trim();
  if (payload.startDate || payload.start_date) {
    body.startDate = payload.startDate ?? payload.start_date;
  }
  if (payload.endDate || payload.end_date) {
    body.endDate = payload.endDate ?? payload.end_date;
  }

  return body;
};

export const academicYearService = {
  async getAcademicYears(params: Record<string, any> = {}) {
    return asList(await apiFetch("/academic-years", { method: "GET", params }));
  },

  async getAcademicYear(id: string) {
    return firstRow(await apiFetch(`/academic-years/${id}`, { method: "GET" }));
  },

  async createAcademicYear(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/academic-years", {
        method: "POST",
        body: academicYearBody(payload),
      }),
    );
  },

  async updateAcademicYear(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/academic-years/${id}`, {
        method: "PATCH",
        body: academicYearBody(payload),
      }),
    );
  },

  async activateAcademicYear(id: string) {
    return firstRow(
      await apiFetch(`/academic-years/${id}/activate`, {
        method: "POST",
      }),
    );
  },

  /**
   * Download the complete academic-year Excel business report.
   * Backend owns all financial calculations.
   */
  async exportAcademicYear(
    id: string,
    params: AcademicYearExportParams = {},
  ) {
    const query: Record<string, any> = {
      format: params.format || "xlsx",
    };
    if (params.branchId) query.branchId = params.branchId;
    if (params.from) query.from = params.from;
    if (params.to) query.to = params.to;

    return apiFetchBlob(`/academic-years/${id}/export`, {
      method: "GET",
      params: query,
    });
  },
};
