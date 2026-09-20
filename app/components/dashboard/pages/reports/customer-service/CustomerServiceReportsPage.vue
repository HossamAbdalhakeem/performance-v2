<template>
  <DailyReportShell
    title="تقرير خدمة العملاء"
    subtitle="نشاطك عبر كل الفروع — المدفوعات وملخص الحجوزات"
    hero-title="مدفوعات حجوزاتك"
    payment-total-label="إجمالي المحصل"
    :loading="loading"
    :payments-total="summary.paymentsTotal ?? 0"
    :refunds-total="Number(summary.refundsTotal || 0)"
    :hero-chips="heroChips"
    :payment-method-items="paymentMethodItems"
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
import { buildCustomerServiceHeroChips } from "~/utils/dailyReportMetrics";
import { reportService } from "~/services/reportService";
import { useAppToast } from "~/composables/useAppToast";
import DailyReportFilters from "~/components/dashboard/pages/reports/daily/DailyReportFilters/index.vue";

defineOptions({ name: "CustomerServiceReportsPage" });

const DailyReportShell = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportShell/index.vue"),
);

const { showError } = useAppToast();

const loading = ref(true);
const summary = ref({});
const filterParams = ref(null);
let loadGeneration = 0;

const paymentMethodItems = computed(() =>
  Array.isArray(summary.value.paymentsByMethod)
    ? summary.value.paymentsByMethod
    : [],
);

const heroChips = computed(() =>
  buildCustomerServiceHeroChips(summary.value),
);

const loadReport = async () => {
  if (!filterParams.value) return;

  const generation = ++loadGeneration;
  loading.value = true;
  const params = filterParams.value;

  try {
    const paymentsPayload =
      await reportService.getCustomerServiceSummary(params);
    if (generation !== loadGeneration) return;
    summary.value = { ...(paymentsPayload?.summary || {}) };
  } catch (error) {
    if (generation !== loadGeneration) return;
    summary.value = {};
    showError(error?.message || "تعذر تحميل التقرير.");
  } finally {
    if (generation === loadGeneration) loading.value = false;
  }
};

const onFiltersChange = (params) => {
  filterParams.value = params;
  loadReport();
};
</script>
