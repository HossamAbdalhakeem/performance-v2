import { useAppToast } from "~/composables/useAppToast";

/**
 * Self-contained admin report section loader.
 * Reloads whenever `params` or `reloadKey` change.
 */
export const useAdminReportSection = (loader, options = {}) => {
  const {
    params,
    reloadKey = ref(0),
    immediate = true,
    errorMessage = "تعذر تحميل جزء من التقارير.",
    transform = (data) => data,
    emit,
  } = options;

  const { showError } = useAppToast();
  const loading = ref(Boolean(immediate));
  const data = ref(null);
  let generation = 0;

  const setLoading = (value) => {
    loading.value = value;
    emit?.("loading", value);
  };

  const paramsKey = computed(() => {
    const p = unref(params) || {};
    const key = unref(reloadKey) ?? 0;
    return `${JSON.stringify({
      from: p.from || null,
      to: p.to || null,
      branchId: p.branchId || null,
      productId: p.productId || null,
      academicYearId: p.academicYearId || null,
    })}:${key}`;
  });

  const reload = async () => {
    const current = unref(params) || {};
    if (!current.from || !current.to) {
      setLoading(false);
      return;
    }

    const gen = ++generation;
    setLoading(true);
    try {
      const result = await loader(current);
      if (gen !== generation) return;
      data.value = transform(result);
    } catch (error) {
      if (gen !== generation) return;
      data.value = null;
      showError(error?.message || errorMessage);
    } finally {
      if (gen === generation) setLoading(false);
    }
  };

  watch(paramsKey, () => {
    reload();
  }, { immediate });

  return {
    loading,
    data,
    reload,
  };
};
