import { apiFetch, apiFetchBlob, firstRow, asList } from "~/utils/apiFetch";

export type AcademicYearExportParams = {
  format?: "xlsx";
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
  /** @deprecated use dateFrom */
  from?: string;
  /** @deprecated use dateTo */
  to?: string;
  /** Comma-separated section keys */
  sections?: string;
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
    const dateFrom = params.dateFrom ?? params.from;
    const dateTo = params.dateTo ?? params.to;
    if (dateFrom) query.dateFrom = dateFrom;
    if (dateTo) query.dateTo = dateTo;
    if (params.sections) query.sections = params.sections;

    return apiFetchBlob(`/academic-years/${id}/export`, {
      method: "GET",
      params: query,
    });
  },
};
