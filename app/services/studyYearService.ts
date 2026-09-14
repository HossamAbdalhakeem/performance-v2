import { apiFetch } from "~/utils/apiFetch";

export const studyYearService = {
  async getStudyYears(params: Record<string, any> = {}) {
    return await apiFetch("/study-years", {
      method: "GET",
      params,
    });
  },
};
