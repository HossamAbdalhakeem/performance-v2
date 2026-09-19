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
        :academic-year-range="academicYearRange"
        :loading="anyLoading"
        class="w-full min-w-0"
        @change="onFiltersChange"
        @refresh="reloadAll"
      />
    </div>

    <!-- KPIs -->
    <div v-if="loading.kpis" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="i in 4"
        :key="`kpi-skel-${i}`"
        class="rounded-xl border border-white/10 bg-slate-900 p-4"
      >
        <Skeleton width="7rem" height="0.9rem" class="mb-3" />
        <Skeleton width="60%" height="1.8rem" />
      </div>
    </div>
    <ReportsSummaryCards v-else :summary="kpisSummary" />

    <!-- Inventory -->
    <ReportsInventoryTable
      :by-type="inventory?.byType || []"
      :books="inventory?.books"
      :cards="inventory?.cards"
      :booklets="inventory?.booklets"
      :loading="loading.inventory"
    />

    <!-- Financials -->
    <div
      v-if="loading.financial"
      class="rounded-xl border border-white/10 bg-slate-900 p-4"
    >
      <Skeleton width="8rem" height="1rem" class="mb-4" />
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton v-for="i in 4" :key="`fin-${i}`" height="4.5rem" />
      </div>
    </div>
    <ReportsFinancialsSection
      v-else
      :financials="financials"
      :breakdown="financialBreakdown"
      :refunds-total="financialRefundsTotal"
      :reservation-deposits="reservationDeposits"
      :general-expenses="generalExpensesSeparate"
      :is-branch-scoped="isBranchScoped"
    />

    <!-- Payments -->
    <div
      v-if="loading.payments"
      class="rounded-xl border border-white/10 bg-slate-900 p-4"
    >
      <Skeleton width="8rem" height="1rem" class="mb-3" />
      <Skeleton width="100%" height="6rem" />
    </div>
    <PaymentMethodsReport
      v-else
      :items="paymentMethodItems"
      total-label="إجمالي المدفوعات"
    />

    <!-- Customers -->
    <div
      v-if="loading.customers"
      class="rounded-xl border border-white/10 bg-slate-900 p-4"
    >
      <Skeleton width="8rem" height="1rem" class="mb-4" />
      <div class="grid gap-4 xl:grid-cols-2">
        <Skeleton height="12rem" />
        <Skeleton height="12rem" />
      </div>
    </div>
    <ReportsCustomersSection
      v-else
      :year-labels="customersByYearLabels"
      :year-values="customersByYearValues"
      :students="studentRows"
    />
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import ReportsFilters from "~/components/dashboard/pages/reports/summary/ReportsFilters.vue";
import { reportService } from "~/services/reportService";
import { academicYearService } from "~/services/academicYearService";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYearId } from "~/composables/useAcademicYearId";
import { UNSPECIFIED_LABEL } from "~/utils/domainLabels";

const ReportsSummaryCards = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/summary/ReportsSummaryCards.vue"),
);
const ReportsInventoryTable = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/summary/ReportsInventoryTable.vue"),
);
const ReportsFinancialsSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/summary/ReportsFinancialsSection.vue"),
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

const toDateInput = (value) => {
  if (!value) return null;
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const todayInputValue = () => toDateInput(new Date()) || "2026-01-01";

const academicYears = ref([]);
const academicYearRange = computed(() => {
  const id = currentAcademicYearId.value;
  if (!id) return null;
  const match = academicYears.value.find((year) => String(year.id) === String(id));
  if (!match) return null;
  const from = toDateInput(match.startDate);
  const to = toDateInput(match.endDate);
  if (!from || !to) return null;
  return { from, to };
});

const today = todayInputValue();
const dateFrom = ref(
  typeof route.query.from === "string" && route.query.from
    ? toDateInput(route.query.from)
    : null,
);
const dateTo = ref(
  typeof route.query.to === "string" && route.query.to
    ? toDateInput(route.query.to)
    : null,
);
const selectedBranch = ref(
  route.query.branchId ? String(route.query.branchId) : "all",
);
const selectedBook = ref(
  route.query.productId ? String(route.query.productId) : null,
);

const loading = reactive({
  kpis: true,
  inventory: true,
  financial: true,
  payments: true,
  customers: true,
});

const kpis = ref(null);
const inventory = ref(null);
const financialReport = ref(null);
const payments = ref(null);
const customers = ref(null);

const anyLoading = computed(() => Object.values(loading).some(Boolean));

const kpisSummary = computed(() => kpis.value?.summary || {});

const financials = computed(() => {
  const fromFinancial = financialReport.value?.financials;
  if (!fromFinancial) return {};
  return {
    ...fromFinancial,
    branchExpenses: fromFinancial.academicYearExpenses,
    operatingExpenses: fromFinancial.academicYearExpenses,
    generalExpenses: financialReport.value?.separate?.generalExpenses ?? 0,
  };
});

const financialBreakdown = computed(
  () => financialReport.value?.breakdown || {},
);
const financialRefundsTotal = computed(
  () => financialReport.value?.refundsTotal ?? 0,
);
const reservationDeposits = computed(
  () =>
    financialReport.value?.separate?.reservationDeposits ??
    financialReport.value?.breakdown?.reservationDeposits ??
    0,
);
const generalExpensesSeparate = computed(
  () => financialReport.value?.separate?.generalExpenses ?? 0,
);
const isBranchScoped = computed(
  () => Boolean(selectedBranch.value && selectedBranch.value !== "all"),
);

const paymentMethodItems = computed(() =>
  Array.isArray(payments.value?.paymentsByMethod)
    ? payments.value.paymentsByMethod
    : [],
);

const customersByYearLabels = computed(() =>
  (customers.value?.customersByYear || []).map((row) =>
    row.label === "unspecified" || !row.label ? UNSPECIFIED_LABEL : row.label,
  ),
);

const customersByYearValues = computed(() =>
  (customers.value?.customersByYear || []).map((row) => Number(row.value || 0)),
);

const studentRows = computed(() =>
  Array.isArray(customers.value?.studentPurchases)
    ? customers.value.studentPurchases
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

const reportParams = () => {
  const params = {
    ...dateRangeParams(),
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

const syncRouteQuery = () => {
  const query = {
    from: dateFrom.value || todayInputValue(),
    to: dateTo.value || dateFrom.value || todayInputValue(),
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
    String(current.branchId || "") === String(query.branchId || "") &&
    String(current.productId || "") === String(query.productId || "") &&
    String(current.academicYearId || "") === String(query.academicYearId || "");

  if (!same) {
    router.replace({ query });
  }
};

const loadSection = async (key, loader) => {
  loading[key] = true;
  try {
    return await loader();
  } catch (error) {
    showError(error?.message || "تعذر تحميل جزء من التقارير.");
    return null;
  } finally {
    loading[key] = false;
  }
};

const reloadAll = async () => {
  syncRouteQuery();
  const params = reportParams();

  const [kpisData, inventoryData, financialData, paymentsData, customersData] =
    await Promise.all([
      loadSection("kpis", () => reportService.getAdminKpis(params)),
      loadSection("inventory", () => reportService.getAdminInventory(params)),
      loadSection("financial", () =>
        reportService.getFinancialReport(params).catch(() => null),
      ),
      loadSection("payments", () => reportService.getAdminPayments(params)),
      loadSection("customers", () => reportService.getAdminCustomers(params)),
    ]);

  kpis.value = kpisData;
  inventory.value = inventoryData;
  financialReport.value = financialData;
  payments.value = paymentsData;
  customers.value = customersData;
};

const onFiltersChange = (payload) => {
  if (payload && typeof payload === "object") {
    if ("from" in payload) dateFrom.value = payload.from || null;
    if ("to" in payload) dateTo.value = payload.to || payload.from || null;
  }

  if (!dateFrom.value && !dateTo.value && academicYearRange.value) {
    dateFrom.value = academicYearRange.value.from;
    dateTo.value = academicYearRange.value.to;
  }

  reloadAll();
};

const loadAcademicYears = async () => {
  try {
    academicYears.value = await academicYearService.getAcademicYears();
  } catch {
    academicYears.value = [];
  }

  if (!dateFrom.value || !dateTo.value) {
    if (academicYearRange.value) {
      dateFrom.value = academicYearRange.value.from;
      dateTo.value = academicYearRange.value.to;
    } else {
      dateFrom.value = today;
      dateTo.value = today;
    }
  }
};

watch(currentAcademicYearId, async () => {
  if (academicYearRange.value) {
    dateFrom.value = academicYearRange.value.from;
    dateTo.value = academicYearRange.value.to;
  }
  await reloadAll();
});

onMounted(async () => {
  await loadAcademicYears();
  await reloadAll();
});
</script>
