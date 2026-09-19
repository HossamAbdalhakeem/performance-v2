import { useLocalStorage } from "~/composables/useLocalStorage";

const STORAGE_KEY = "academicYearId";

/** Current academic year id from localStorage (used by apiFetch + forms). */
export const useAcademicYearId = () => {
  const storage = useLocalStorage(STORAGE_KEY);

  const academicYearId = computed(() => {
    const value = storage.value;
    return value ? String(value) : null;
  });

  const setAcademicYearId = (id) => {
    storage.value = id ? String(id) : null;
  };

  return {
    academicYearId,
    setAcademicYearId,
    STORAGE_KEY,
  };
};
