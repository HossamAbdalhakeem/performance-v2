import { reportService } from "~/services/reportService";
import { useAppToast } from "~/composables/useAppToast";

const DETAIL_SECTIONS = new Set([
  "sales",
  "reservations",
  "undelivered",
  "delivered",
  "cancelled",
  "received",
  "stockOut",
  "allMovements",
  "returns",
  "exchanges",
  "refunds",
]);

const todayInputValue = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const mapUndeliveredReservationRows = (rows) =>
  rows.map((item) => ({
    time: item.createdAt || item.created_at,
    number: item.reservationNumber || item.reservation_number || item.id,
    student: item.student?.name || "-",
    product: item.product?.name || "-",
    status: item.status,
    statusLabel: item.statusLabel || item.status || "-",
    paid: item.paidAmount ?? item.paid_amount ?? 0,
    by: item.createdBy?.fullName || item.createdBy?.name || "-",
    paymentId: item.payments?.[0]?.id || null,
    paymentMethod: item.payments?.[0]?.method || "",
    paymentMethodLabel: item.payments?.[0]?.method || "",
    proofReference: item.payments?.[0]?.proofReference || null,
    hasProof: Boolean(item.payments?.[0]?.proofReference),
    proofUrl: item.payments?.[0]?.proofUrl || null,
    branch: item.branch?.name || "-",
  }));

/**
 * Shared daily-report data loading for branch / customer-service pages.
 */
export const useDailyReportPage = () => {
  const { showError } = useAppToast();

  const loading = ref(true);
  const detailLoading = ref(false);
  const report = ref(null);
  const detailCache = ref({});
  const detailVisible = ref(false);
  const activeDetailKey = ref(null);
  const today = todayInputValue();
  const dateFrom = ref(today);
  const dateTo = ref(today);

  const summary = computed(() => report.value?.summary || {});

  const paymentMethodItems = computed(() =>
    Array.isArray(summary.value.paymentsByMethod)
      ? summary.value.paymentsByMethod
      : [],
  );

  const activeDetailRows = computed(() => {
    if (!activeDetailKey.value) return [];
    return detailCache.value[activeDetailKey.value] || [];
  });

  const dateRangeParams = () => {
    const fromBase = dateFrom.value || dateTo.value || todayInputValue();
    const toBase = dateTo.value || dateFrom.value || todayInputValue();
    const from = new Date(`${fromBase}T00:00:00`);
    const to = new Date(`${toBase}T23:59:59.999`);
    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  };

  const openDetail = async (key) => {
    if (!DETAIL_SECTIONS.has(key)) return;

    activeDetailKey.value = key;
    detailVisible.value = true;

    if (Object.hasOwn(detailCache.value, key)) return;

    detailLoading.value = true;
    try {
      const apiSection = key === "undelivered" ? "reservations" : key;
      const sectionPayload = await reportService.getDailyReportSection(
        apiSection,
        dateRangeParams(),
      );
      const rows = Array.isArray(sectionPayload?.rows)
        ? sectionPayload.rows
        : Array.isArray(sectionPayload?.reservations)
          ? mapUndeliveredReservationRows(sectionPayload.reservations)
          : [];

      const filteredRows =
        key === "undelivered"
          ? rows.filter((row) => {
              const status = String(row.status || row.statusKey || "").toUpperCase();
              return status && status !== "DELIVERED" && status !== "CANCELLED";
            })
          : rows;

      detailCache.value = {
        ...detailCache.value,
        [key]: filteredRows,
      };
    } catch (error) {
      showError(error?.message || "تعذر تحميل تفاصيل التقرير.");
    } finally {
      detailLoading.value = false;
    }
  };

  const closeDetail = () => {
    detailVisible.value = false;
    activeDetailKey.value = null;
  };

  const loadReport = async () => {
    loading.value = true;
    detailCache.value = {};
    detailVisible.value = false;
    activeDetailKey.value = null;
    try {
      report.value = await reportService.getDailyReport({
        ...dateRangeParams(),
        section: "summary",
      });
    } catch (error) {
      report.value = null;
      showError(error?.message || "تعذر تحميل تقرير اليوم.");
    } finally {
      loading.value = false;
    }
  };

  const onDateRangeChange = ({ from, to } = {}) => {
    dateFrom.value = from || null;
    dateTo.value = to || from || null;
    if (!dateFrom.value && !dateTo.value) {
      const fallback = todayInputValue();
      dateFrom.value = fallback;
      dateTo.value = fallback;
    }
    loadReport();
  };

  return {
    loading,
    detailLoading,
    report,
    summary,
    paymentMethodItems,
    dateFrom,
    dateTo,
    detailVisible,
    activeDetailKey,
    activeDetailRows,
    openDetail,
    closeDetail,
    loadReport,
    onDateRangeChange,
  };
};
