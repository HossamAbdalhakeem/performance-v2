<template>
  <div class="w-full min-w-0 space-y-6 overflow-x-hidden text-right" dir="rtl">
    <div class="flex w-full min-w-0 flex-col gap-3">
      <div class="min-w-0">
        <h2 class="text-xl font-bold text-white">التقارير</h2>
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
        class="w-full min-w-0"
        @change="onFiltersChange"
        @refresh="loadReport"
      />
    </div>

    <ReportsLoadingSkeleton v-if="loading" />

    <template v-else>
      <ReportsSummaryCards :summary="summary" :books="books" :cards="cards" />

      <ReportsFinancialsSection
        :financials="financials"
        :reservation-deposits="reservationDeposits"
        :general-expenses="generalExpensesSeparate"
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
    </template>
  </div>
</template>

<script setup>
import ReportsFilters from "~/components/dashboard/pages/reports/summary/ReportsFilters.vue";
import { reportService } from "~/services/reportService";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYearId } from "~/composables/useAcademicYearId";
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
const { academicYearId: currentAcademicYearId } = useAcademicYearId();

const todayInputValue = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const yearStartInputValue = () => `${new Date().getFullYear()}-01-01`;

const today = todayInputValue();
const dateFrom = ref(
  typeof route.query.from === "string" && route.query.from
    ? route.query.from
    : yearStartInputValue(),
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
const financialReport = ref(null);

const summary = computed(() => report.value?.summary || {});
const books = computed(() => summary.value.books || {});
const cards = computed(() => summary.value.cards || {});
const salesBreakdown = computed(() => summary.value.salesBreakdown || {});
const financials = computed(() => {
  const fromFinancial = financialReport.value?.financials;
  if (fromFinancial) {
    return {
      ...fromFinancial,
      branchExpenses: fromFinancial.academicYearExpenses,
      operatingExpenses: fromFinancial.academicYearExpenses,
      generalExpenses: financialReport.value?.separate?.generalExpenses ?? 0,
    };
  }
  return summary.value.financials || {};
});
const reservationDeposits = computed(
  () =>
    financialReport.value?.separate?.reservationDeposits ??
    summary.value.reservationDeposits ??
    0,
);
const generalExpensesSeparate = computed(
  () =>
    financialReport.value?.separate?.generalExpenses ??
    financials.value.generalExpenses ??
    0,
);
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

/** API query params: from, to, branchId?, productId?, academicYearId?, section */
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
  if (currentAcademicYearId.value) {
    params.academicYearId = String(currentAcademicYearId.value);
  }
  return params;
};

/** Keep the page URL in sync with filters including academic year */
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
  if (currentAcademicYearId.value) {
    query.academicYearId = String(currentAcademicYearId.value);
  }

  const current = route.query;
  const same =
    String(current.from || "") === query.from &&
    String(current.to || "") === query.to &&
    String(current.section || "summary") === query.section &&
    String(current.branchId || "") === String(query.branchId || "") &&
    String(current.productId || "") === String(query.productId || "") &&
    String(current.academicYearId || "") === String(query.academicYearId || "");

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
    dateFrom.value = yearStartInputValue();
    dateTo.value = todayInputValue();
  }

  loadReport();
};

const loadReport = async () => {
  loading.value = true;
  syncRouteQuery();
  try {
    const params = reportParams();
    const [daily, financial] = await Promise.all([
      reportService.getDailyReport(params),
      reportService.getFinancialReport(params).catch(() => null),
    ]);
    report.value = daily;
    financialReport.value = financial;
  } catch (error) {
    report.value = null;
    financialReport.value = null;
    showError(error?.message || "تعذر تحميل التقارير.");
  } finally {
    loading.value = false;
  }
};

watch(currentAcademicYearId, () => {
  loadReport();
});

onMounted(loadReport);
</script>
