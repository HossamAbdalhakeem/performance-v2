<template>
  <div class="space-y-6 text-right" dir="rtl">
    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div class="min-w-0">
        <h2 class="shrink-0 text-xl font-bold text-white">التقارير</h2>
        <p class="mt-1 text-sm text-slate-400">
          ملخص المبيعات والأرباح والمصروفات والحجوزات حسب الفلاتر
        </p>
      </div>
      <ReportsFilters
        v-model:book="selectedBook"
        v-model:branch="selectedBranch"
        v-model:from="dateFrom"
        v-model:to="dateTo"
        :loading="loading"
        class="w-full sm:w-auto sm:max-w-full sm:flex-1"
        @change="onFiltersChange"
        @refresh="loadReport"
      />
    </div>

    <ReportsLoadingSkeleton v-if="loading" />

    <template v-else>
      <ReportsSummaryCards :summary="summary" :books="books" />

      <ReportsFinancialsSection
        :financials="financials"
        :reservation-deposits="summary.reservationDeposits"
        :is-branch-scoped="isBranchScoped"
      />

      <ReportsSalesBreakdown
        :breakdown="salesBreakdown"
        :refunds-total="summary.refundsTotal"
        :reservation-deposits="summary.reservationDeposits"
        :financials="financials"
      />

      <PaymentMethodsReport
        :items="paymentMethodItems"
        total-label="إجمالي المدفوعات"
      />

      <ReportsCustomersSection
        :year-labels="customersByYearLabels"
        :year-values="customersByYearValues"
        :students="studentRows"
      />

      <Button
        label="⬇ تصدير كل التقارير Excel"
        class="w-full justify-center"
        severity="secondary"
        :disabled="loading"
        @click="exportReports"
      />
    </template>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import ReportsFilters from "~/components/dashboard/pages/reports/summary/ReportsFilters.vue";
import { reportService } from "~/services/reportService";
import { useAppToast } from "~/composables/useAppToast";
import { UNSPECIFIED_LABEL } from "~/utils/domainLabels";

const ReportsLoadingSkeleton = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/summary/ReportsLoadingSkeleton.vue"),
);
const ReportsSummaryCards = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/summary/ReportsSummaryCards.vue"),
);
const ReportsFinancialsSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/summary/ReportsFinancialsSection.vue"),
);
const ReportsSalesBreakdown = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/summary/ReportsSalesBreakdown.vue"),
);
const PaymentMethodsReport = defineAsyncComponent(() =>
  import("~/components/shared/payment-methods-report/index.vue"),
);
const ReportsCustomersSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/summary/ReportsCustomersSection.vue"),
);

defineOptions({ name: "AdminReportsPage" });

const route = useRoute();
const router = useRouter();
const { showError } = useAppToast();

const todayInputValue = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const today = todayInputValue();
const dateFrom = ref(
  typeof route.query.from === "string" && route.query.from
    ? route.query.from
    : today,
);
const dateTo = ref(
  typeof route.query.to === "string" && route.query.to
    ? route.query.to
    : today,
);
const selectedBranch = ref(
  route.query.branchId ? String(route.query.branchId) : "all",
);
const selectedBook = ref(
  route.query.productId ? String(route.query.productId) : null,
);
const loading = ref(true);
const report = ref(null);

const summary = computed(() => report.value?.summary || {});
const books = computed(() => summary.value.books || {});
const salesBreakdown = computed(() => summary.value.salesBreakdown || {});
const financials = computed(() => summary.value.financials || {});
const isBranchScoped = computed(
  () => Boolean(selectedBranch.value && selectedBranch.value !== "all"),
);

const paymentMethodItems = computed(() =>
  Array.isArray(summary.value.paymentsByMethod)
    ? summary.value.paymentsByMethod
    : [],
);

const customersByYearLabels = computed(() =>
  (report.value?.customersByYear || []).map((row) =>
    row.label === "unspecified" || !row.label ? UNSPECIFIED_LABEL : row.label,
  ),
);

const customersByYearValues = computed(() =>
  (report.value?.customersByYear || []).map((row) => Number(row.value || 0)),
);

const studentRows = computed(() =>
  Array.isArray(report.value?.studentPurchases)
    ? report.value.studentPurchases
    : [],
);

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

/** API query params: from, to, branchId?, productId?, section */
const reportParams = () => {
  const params = {
    ...dateRangeParams(),
    section: "summary",
  };
  if (selectedBranch.value && selectedBranch.value !== "all") {
    params.branchId = selectedBranch.value;
  }
  if (selectedBook.value) {
    params.productId = selectedBook.value;
  }
  return params;
};

/** Keep the page URL in sync: /reports?from=...&to=...&branchId=...&productId=...&section=summary */
const syncRouteQuery = () => {
  const query = {
    from: dateFrom.value || todayInputValue(),
    to: dateTo.value || dateFrom.value || todayInputValue(),
    section: "summary",
  };
  if (selectedBranch.value && selectedBranch.value !== "all") {
    query.branchId = selectedBranch.value;
  }
  if (selectedBook.value) {
    query.productId = String(selectedBook.value);
  }

  const current = route.query;
  const same =
    String(current.from || "") === query.from &&
    String(current.to || "") === query.to &&
    String(current.section || "summary") === query.section &&
    String(current.branchId || "") === String(query.branchId || "") &&
    String(current.productId || "") === String(query.productId || "");

  if (!same) {
    router.replace({ query });
  }
};

const onFiltersChange = (payload) => {
  if (payload && typeof payload === "object") {
    if ("from" in payload) {
      dateFrom.value = payload.from || null;
    }
    if ("to" in payload) {
      dateTo.value = payload.to || payload.from || null;
    }
  }

  if (!dateFrom.value && !dateTo.value) {
    const fallback = todayInputValue();
    dateFrom.value = fallback;
    dateTo.value = fallback;
  }

  loadReport();
};

const loadReport = async () => {
  loading.value = true;
  syncRouteQuery();
  try {
    report.value = await reportService.getDailyReport(reportParams());
  } catch (error) {
    report.value = null;
    showError(error?.message || "تعذر تحميل التقارير.");
  } finally {
    loading.value = false;
  }
};

const exportReports = () => {
  const s = summary.value;
  const breakdown = salesBreakdown.value;
  const f = financials.value;
  const rows = [
    ["اسم الطالب", "المدرس", "الموبايل", "اشترى ايه"],
    ...studentRows.value.map((row) => [
      row.student,
      row.teacher,
      row.phone,
      row.product,
    ]),
    [],
    ["إجمالي المبيعات (إيراد صافي)", s.salesAmount ?? f.revenue ?? 0],
    ["عدد عمليات البيع", s.sales ?? 0],
    ["تكلفة البضاعة COGS", f.cogs ?? 0],
    ["إجمالي الربح", f.grossProfit ?? 0],
    ["مصروفات الفروع", f.branchExpenses ?? 0],
    ["مصروفات عامة", f.generalExpenses ?? 0],
    ["المصروفات التشغيلية", f.operatingExpenses ?? 0],
    ["صافي الربح", f.netProfit ?? breakdown.netProfit ?? 0],
    ["إجمالي الحجوزات", s.reservations ?? 0],
    ["مدفوعات الحجوزات", s.reservationsPaidAmount ?? 0],
    ["عربونات حجوزات معلقة", s.reservationDeposits ?? 0],
    ["إجمالي المخزون", s.inventoryTotal ?? 0],
    ["مبيعات فرع", breakdown.branchSales ?? 0],
    ["محجوزات", breakdown.reservations ?? 0],
    ["مرتجعات", s.refundsTotal ?? 0],
    ["صافي المدفوعات", s.paymentsTotal ?? 0],
    [],
    ["طريقة الدفع", "المبلغ"],
    ...paymentMethodItems.value.map((item) => [item.method, item.amount]),
  ];

  const csv = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "library-reports.csv";
  link.click();
  URL.revokeObjectURL(url);
};

onMounted(loadReport);
</script>
