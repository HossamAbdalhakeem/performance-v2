<template>
  <DailyReportShell
    title="تقرير خدمة العملاء"
    subtitle="نشاطك عبر كل الفروع — اضغط أي بطاقة لعرض التفاصيل"
    hero-title="مدفوعات حجوزاتك"
    payment-total-label="إجمالي المحصل"
    activity-title="توزيع حجوزاتك ونشاطك"
    :loading="loading"
    :sections-loading="sectionsLoading"
    :activity-skeleton-tiles="5"
    :payments-total="summary.paymentsTotal ?? 0"
    :refunds-total="Number(summary.refundsTotal || 0)"
    :hero-chips="heroChips"
    :payment-method-items="paymentMethodItems"
    :activity-metrics="activityMetrics"
    :activity="summary.activity"
    :detail-visible="detailVisible"
    :detail-loading="detailLoading"
    :active-detail-key="activeDetailKey"
    :active-detail-rows="activeDetailRows"
    :is-customer-service="true"
    @update:detail-visible="detailVisible = $event"
    @open-detail="openDetail"
    @close-detail="closeDetail"
  >
    <template #filters>
      <DailyReportFilters
        :loading="loading"
        @change="onFiltersChange"
        @refresh="loadReport"
      />
    </template>
  </DailyReportShell>
</template>

<script setup>
import {
  buildCustomerServiceActivityMetrics,
  buildCustomerServiceHeroChips,
} from "~/utils/dailyReportMetrics";
import { reportService } from "~/services/reportService";
import { useAppToast } from "~/composables/useAppToast";
import DailyReportFilters from "~/components/dashboard/pages/reports/DailyReportFilters.vue";

defineOptions({ name: "CustomerServiceReportsPage" });

const DailyReportShell = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportShell.vue"),
);

const SECTION_KEYS = ["reservations", "delivered", "cancelled"];
const DETAIL_KEYS = [
  "reservations",
  "delivered",
  "cancelled",
  "undelivered",
];

const { showError } = useAppToast();

const loading = ref(true);
const sectionsLoading = ref(false);
const detailLoading = ref(false);
const summary = ref({});
const detailCache = ref({});
const detailVisible = ref(false);
const activeDetailKey = ref(null);
const filterParams = ref(null);
let loadGeneration = 0;

const paymentMethodItems = computed(() =>
  Array.isArray(summary.value.paymentsByMethod)
    ? summary.value.paymentsByMethod
    : [],
);

const activeDetailRows = computed(() => {
  if (!activeDetailKey.value) return [];
  return detailCache.value[activeDetailKey.value] || [];
});

const heroChips = computed(() =>
  buildCustomerServiceHeroChips(summary.value),
);
const activityMetrics = computed(() =>
  buildCustomerServiceActivityMetrics(summary.value),
);

const extractRows = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.reservations)) return payload.reservations;
  return [];
};

const isUndeliveredStatus = (status) => {
  const value = String(status || "").toUpperCase();
  return Boolean(value) && value !== "DELIVERED" && value !== "CANCELLED";
};

const buildActivitySummary = (sectionsMap) => {
  const reservationRows = extractRows(sectionsMap.reservations);
  const deliveredRows = extractRows(sectionsMap.delivered);
  const cancelledRows = extractRows(sectionsMap.cancelled);

  return {
    reservations: reservationRows.length,
    deliveredReservations: deliveredRows.length,
    cancelledReservations: cancelledRows.length,
    undeliveredReservations: reservationRows.filter((row) =>
      isUndeliveredStatus(row.status || row.statusKey),
    ).length,
    readyReservations: reservationRows.filter(
      (row) => String(row.status || "").toUpperCase() === "READY",
    ).length,
  };
};

const rowsForDetailKey = (key, sectionsMap) => {
  if (key === "undelivered") {
    return extractRows(sectionsMap.reservations).filter((row) =>
      isUndeliveredStatus(row.status || row.statusKey),
    );
  }
  return extractRows(sectionsMap[key]);
};

const apiSectionForDetailKey = (key) =>
  key === "undelivered" ? "reservations" : key;

const closeDetail = () => {
  detailVisible.value = false;
  activeDetailKey.value = null;
};

const openDetail = async (key) => {
  if (!DETAIL_KEYS.includes(key) || !filterParams.value) return;

  activeDetailKey.value = key;
  detailVisible.value = true;

  if (Object.prototype.hasOwnProperty.call(detailCache.value, key)) return;

  detailLoading.value = true;
  try {
    const section = apiSectionForDetailKey(key);
    const payload = await reportService.getCustomerServiceSection(
      section,
      filterParams.value,
    );
    const sectionsMap = { [section]: payload };
    const next = { ...detailCache.value };

    if (key === "undelivered" || section === "reservations") {
      next.reservations = rowsForDetailKey("reservations", sectionsMap);
      next.undelivered = rowsForDetailKey("undelivered", sectionsMap);
    } else {
      next[key] = rowsForDetailKey(key, sectionsMap);
    }

    detailCache.value = next;
  } catch (error) {
    showError(error?.message || "تعذر تحميل التفاصيل.");
  } finally {
    detailLoading.value = false;
  }
};

const loadSectionsInBackground = async (params, generation) => {
  try {
    const sectionResults = await Promise.allSettled(
      SECTION_KEYS.map((section) =>
        reportService.getCustomerServiceSection(section, params),
      ),
    );

    if (generation !== loadGeneration) return;

    const sectionsMap = {};
    SECTION_KEYS.forEach((section, index) => {
      const result = sectionResults[index];
      sectionsMap[section] =
        result?.status === "fulfilled" ? result.value : null;
    });

    const nextCache = {};
    for (const key of DETAIL_KEYS) {
      nextCache[key] = rowsForDetailKey(key, sectionsMap);
    }
    detailCache.value = nextCache;
    summary.value = {
      ...summary.value,
      ...buildActivitySummary(sectionsMap),
    };

    if (sectionResults.some((result) => result.status === "rejected")) {
      showError("تعذر تحميل بعض أقسام التقرير.");
    }
  } finally {
    if (generation === loadGeneration) sectionsLoading.value = false;
  }
};

const loadReport = async () => {
  if (!filterParams.value) return;

  const generation = ++loadGeneration;
  loading.value = true;
  sectionsLoading.value = false;
  detailCache.value = {};
  detailVisible.value = false;
  activeDetailKey.value = null;

  const params = filterParams.value;

  try {
    const paymentsPayload =
      await reportService.getCustomerServiceSummary(params);
    if (generation !== loadGeneration) return;

    summary.value = { ...(paymentsPayload?.summary || {}) };
    sectionsLoading.value = true;
  } catch (error) {
    if (generation !== loadGeneration) return;
    summary.value = {};
    detailCache.value = {};
    sectionsLoading.value = false;
    showError(error?.message || "تعذر تحميل تقرير اليوم.");
    return;
  } finally {
    if (generation === loadGeneration) loading.value = false;
  }

  // Keep the page interactive; fill activity counts / detail cache quietly.
  await loadSectionsInBackground(params, generation);
};

const onFiltersChange = (params) => {
  filterParams.value = params;
  loadReport();
};
</script>
