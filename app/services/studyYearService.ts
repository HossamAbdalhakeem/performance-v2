const fallbackStudyYears = [
  { id: "1", name: "أولى", label: "أولى" },
  { id: "2", name: "تانية", label: "تانية" },
  { id: "3", name: "تالتة", label: "تالتة" },
  { id: "4", name: "رابعة", label: "رابعة" },
  { id: "5", name: "خامسة", label: "خامسة" },
  { id: "bac2", name: "٢ بكالوريا", label: "٢ بكالوريا" },
];

import { apiFetch } from "~/utils/apiFetch";

export const studyYearService = {
  async getStudyYears(params = {}) {
    try {
      return await apiFetch("/study_years", {
        method: "GET",
        params,
      });
    } catch {
      return fallbackStudyYears;
    }
  },
};
