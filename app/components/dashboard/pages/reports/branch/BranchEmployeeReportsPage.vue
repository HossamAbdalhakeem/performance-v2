<template>
  <DailyReportShell
    title="التقرير"
    subtitle="نظرة سريعة على نشاط الفرع والمدفوعات وعمليات المخزن والطلاب"
    hero-title="صافي المدفوعات"
    :loading="loading"
    :payments-total="summary.paymentsTotal"
    :refunds-total="Number(summary.refundsTotal || 0)"
    :hero-chips="heroChips"
    :payment-method-items="paymentMethodItems"
    show-operations
    :stock-rows="stockRows"
    :stock-loading="stockLoading"
    :stock-error="stockError"
    :stock-page="stockPage"
    :stock-page-size="pageSize"
    :stock-total="stockTotal"
    :stock-type="stockType"
    :student-rows="studentRows"
    :student-loading="studentLoading"
    :student-error="studentError"
    :student-page="studentPage"
    :student-page-size="pageSize"
    :student-total="studentTotal"
    :student-type="studentType"
    :exchange-rows="exchangeRows"
    :exchange-loading="exchangeLoading"
    :exchange-error="exchangeError"
    :exchange-page="exchangePage"
    :exchange-page-size="pageSize"
    :exchange-total="exchangeTotal"
    :exchange-type="exchangeType"
    :adjustment-rows="adjustmentRows"
    :adjustment-loading="adjustmentLoading"
    :adjustment-error="adjustmentError"
    :adjustment-page="adjustmentPage"
    :adjustment-page-size="pageSize"
    :adjustment-total="adjustmentTotal"
    :adjustment-type="adjustmentType"
    @retry-stock="loadStockOperations"
    @retry-student="loadStudentOperations"
    @retry-exchanges="loadExchanges"
    @retry-adjustments="loadAdjustments"
    @update:stock-page="onStockPage"
    @update:stock-type="onStockType"
    @update:student-page="onStudentPage"
    @update:student-type="onStudentType"
    @update:exchange-page="onExchangePage"
    @update:exchange-type="onExchangeType"
    @update:adjustment-page="onAdjustmentPage"
    @update:adjustment-type="onAdjustmentType"
  >
    <template #filters>
      <DailyReportFilters
        :loading="
          loading ||
          stockLoading ||
          studentLoading ||
          exchangeLoading ||
          adjustmentLoading
        "
        @change="onFiltersChange"
        @refresh="loadReport"
      />
    </template>
  </DailyReportShell>
</template>

<script setup>
import { buildBranchHeroChips } from "~/utils/dailyReportMetrics";
import { reportService } from "~/services/reportService";
import { useAppToast } from "~/composables/useAppToast";
import DailyReportFilters from "~/components/dashboard/pages/reports/daily/DailyReportFilters/index.vue";

defineOptions({ name: "BranchEmployeeReportsPage" });

const DailyReportShell = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportShell/index.vue"),
);

const { showError } = useAppToast();

const loading = ref(true);
const pageSize = 15;
const summary = ref({});
const filterParams = ref(null);
let loadGeneration = 0;

const stockLoading = ref(false);
const stockError = ref("");
const stockRows = ref([]);
const stockPage = ref(1);
const stockTotal = ref(0);
const stockType = ref(null);

const studentLoading = ref(false);
const studentError = ref("");
const studentRows = ref([]);
const studentPage = ref(1);
const studentTotal = ref(0);
const studentType = ref(null);

const exchangeLoading = ref(false);
const exchangeError = ref("");
const exchangeRows = ref([]);
const exchangePage = ref(1);
const exchangeTotal = ref(0);
const exchangeType = ref(null);

const adjustmentLoading = ref(false);
const adjustmentError = ref("");
const adjustmentRows = ref([]);
const adjustmentPage = ref(1);
const adjustmentTotal = ref(0);
const adjustmentType = ref(null);

const paymentMethodItems = computed(() =>
  Array.isArray(summary.value.paymentsByMethod)
    ? summary.value.paymentsByMethod
    : [],
);

const heroChips = computed(() => buildBranchHeroChips(summary.value));

const extractRows = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.rows)) return payload.rows;
  return [];
};

const extractTotal = (payload) => {
  if (Array.isArray(payload)) return payload.length;
  return Number(payload?.pagination?.total ?? payload?.meta?.total ?? 0);
};

const loadStockOperations = async (
  params = filterParams.value,
  generation = loadGeneration,
) => {
  if (!params) return;
  stockLoading.value = true;
  stockError.value = "";
  try {
    const payload = await reportService.getBranchSection("stockOperations", {
      ...params,
      page: stockPage.value,
      per_page: pageSize,
      ...(stockType.value ? { movementType: stockType.value } : {}),
    });
    if (generation !== loadGeneration) return;
    stockRows.value = extractRows(payload);
    stockTotal.value = extractTotal(payload);
  } catch (error) {
    if (generation !== loadGeneration) return;
    stockRows.value = [];
    stockTotal.value = 0;
    stockError.value = error?.message || "تعذر تحميل عمليات المخزن.";
  } finally {
    if (generation === loadGeneration) stockLoading.value = false;
  }
};

const loadStudentOperations = async (
  params = filterParams.value,
  generation = loadGeneration,
) => {
  if (!params) return;
  studentLoading.value = true;
  studentError.value = "";
  try {
    const payload = await reportService.getBranchSection("studentOperations", {
      ...params,
      page: studentPage.value,
      per_page: pageSize,
      ...(studentType.value ? { movementType: studentType.value } : {}),
    });
    if (generation !== loadGeneration) return;
    studentRows.value = extractRows(payload);
    studentTotal.value = extractTotal(payload);
  } catch (error) {
    if (generation !== loadGeneration) return;
    studentRows.value = [];
    studentTotal.value = 0;
    studentError.value = error?.message || "تعذر تحميل عمليات الطلاب.";
  } finally {
    if (generation === loadGeneration) studentLoading.value = false;
  }
};

const loadExchanges = async (
  params = filterParams.value,
  generation = loadGeneration,
) => {
  if (!params) return;
  exchangeLoading.value = true;
  exchangeError.value = "";
  try {
    const payload = await reportService.getBranchSection("studentExchanges", {
      ...params,
      page: exchangePage.value,
      per_page: pageSize,
      ...(exchangeType.value ? { movementType: exchangeType.value } : {}),
    });
    if (generation !== loadGeneration) return;
    exchangeRows.value = extractRows(payload);
    exchangeTotal.value = extractTotal(payload);
  } catch (error) {
    if (generation !== loadGeneration) return;
    exchangeRows.value = [];
    exchangeTotal.value = 0;
    exchangeError.value = error?.message || "تعذر تحميل عمليات الاستبدال.";
  } finally {
    if (generation === loadGeneration) exchangeLoading.value = false;
  }
};

const loadAdjustments = async (
  params = filterParams.value,
  generation = loadGeneration,
) => {
  if (!params) return;
  adjustmentLoading.value = true;
  adjustmentError.value = "";
  try {
    const payload = await reportService.getBranchSection("studentAdjustments", {
      ...params,
      page: adjustmentPage.value,
      per_page: pageSize,
      ...(adjustmentType.value ? { movementType: adjustmentType.value } : {}),
    });
    if (generation !== loadGeneration) return;
    adjustmentRows.value = extractRows(payload);
    adjustmentTotal.value = extractTotal(payload);
  } catch (error) {
    if (generation !== loadGeneration) return;
    adjustmentRows.value = [];
    adjustmentTotal.value = 0;
    adjustmentError.value = error?.message || "تعذر تحميل الاسترداد والإلغاء.";
  } finally {
    if (generation === loadGeneration) adjustmentLoading.value = false;
  }
};

const loadReport = async () => {
  if (!filterParams.value) return;

  const generation = ++loadGeneration;
  loading.value = true;
  stockRows.value = [];
  studentRows.value = [];
  exchangeRows.value = [];
  adjustmentRows.value = [];
  stockError.value = "";
  studentError.value = "";
  exchangeError.value = "";
  adjustmentError.value = "";
  stockPage.value = 1;
  studentPage.value = 1;
  exchangePage.value = 1;
  adjustmentPage.value = 1;

  const params = filterParams.value;

  try {
    const paymentsPayload = await reportService.getBranchSummary(params);
    if (generation !== loadGeneration) return;
    summary.value = { ...(paymentsPayload?.summary || {}) };
  } catch (error) {
    if (generation !== loadGeneration) return;
    summary.value = {};
    showError(error?.message || "تعذر تحميل التقرير.");
    return;
  } finally {
    if (generation === loadGeneration) loading.value = false;
  }

  await Promise.all([
    loadStockOperations(params, generation),
    loadStudentOperations(params, generation),
    loadExchanges(params, generation),
    loadAdjustments(params, generation),
  ]);
};

const onStockPage = (page) => {
  stockPage.value = Number(page) || 1;
  loadStockOperations();
};

const onStockType = (type) => {
  stockType.value = type || null;
  stockPage.value = 1;
  loadStockOperations();
};

const onStudentPage = (page) => {
  studentPage.value = Number(page) || 1;
  loadStudentOperations();
};

const onStudentType = (type) => {
  studentType.value = type || null;
  studentPage.value = 1;
  loadStudentOperations();
};

const onExchangePage = (page) => {
  exchangePage.value = Number(page) || 1;
  loadExchanges();
};

const onExchangeType = (type) => {
  exchangeType.value = type || null;
  exchangePage.value = 1;
  loadExchanges();
};

const onAdjustmentPage = (page) => {
  adjustmentPage.value = Number(page) || 1;
  loadAdjustments();
};

const onAdjustmentType = (type) => {
  adjustmentType.value = type || null;
  adjustmentPage.value = 1;
  loadAdjustments();
};

const onFiltersChange = (params) => {
  filterParams.value = params;
  stockType.value = null;
  studentType.value = null;
  exchangeType.value = null;
  adjustmentType.value = null;
  loadReport();
};
</script>
