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
        @refresh="refreshAll"
      />
    </div>

    <ReportsSummaryCards
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('kpis', $event)"
    />
    <ReportsInventoryTable
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('inventory', $event)"
    />
    <ReportsFinancialsSection
      :params="reportParams"
      :reload-key="reloadKey"
      :is-branch-scoped="isBranchScoped"
      @loading="setSectionLoading('financial', $event)"
    />
    <ReportsPaymentsSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('payments', $event)"
    />
    <ReportsCustomersSection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="setSectionLoading('customers', $event)"
    />
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import ReportsFilters from "~/components/dashboard/pages/reports/admin/ReportsFilters/index.vue";
import { useAcademicYearId } from "~/composables/useAcademicYearId";
import { useAcademicYearStore } from "~/store/academicYear.js";

const ReportsSummaryCards = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsSummaryCards/index.vue"),
);
const ReportsInventoryTable = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsInventoryTable/index.vue"),
);
const ReportsFinancialsSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsFinancialsSection/index.vue"),
);
const ReportsPaymentsSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsPaymentsSection/index.vue"),
);
const ReportsCustomersSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/admin/ReportsCustomersSection/index.vue"),
);

defineOptions({ name: "AdminReportsPage" });

const route = useRoute();
const router = useRouter();
const { academicYearId: currentAcademicYearId } = useAcademicYearId();
const academicYearStore = useAcademicYearStore();
const { years: academicYears } = storeToRefs(academicYearStore);

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

const academicYearRange = computed(() => {
  const id = currentAcademicYearId.value;
  if (!id) return null;
  const match = academicYears.value.find(
    (year) => String(year.id) === String(id),
  );
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

const reloadKey = ref(0);
const sectionLoading = reactive({
  kpis: false,
  inventory: false,
  financial: false,
  payments: false,
  customers: false,
});

const anyLoading = computed(() => Object.values(sectionLoading).some(Boolean));
const isBranchScoped = computed(
  () => Boolean(selectedBranch.value && selectedBranch.value !== "all"),
);

const reportParams = computed(() => {
  const fromBase = dateFrom.value || dateTo.value || todayInputValue();
  const toBase = dateTo.value || dateFrom.value || todayInputValue();
  const from = new Date(`${fromBase}T00:00:00`);
  const to = new Date(`${toBase}T23:59:59.999`);
  const params = {
    from: from.toISOString(),
    to: to.toISOString(),
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
});

const setSectionLoading = (key, value) => {
  sectionLoading[key] = Boolean(value);
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

const refreshAll = () => {
  syncRouteQuery();
  reloadKey.value += 1;
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

  syncRouteQuery();
};

const ensureDateRange = () => {
  if (dateFrom.value && dateTo.value) return;
  if (academicYearRange.value) {
    dateFrom.value = academicYearRange.value.from;
    dateTo.value = academicYearRange.value.to;
  } else {
    dateFrom.value = today;
    dateTo.value = today;
  }
};

watch(currentAcademicYearId, () => {
  if (academicYearRange.value) {
    dateFrom.value = academicYearRange.value.from;
    dateTo.value = academicYearRange.value.to;
  }
  syncRouteQuery();
});

onMounted(async () => {
  await academicYearStore.fetchYears().catch(() => {});
  ensureDateRange();
  syncRouteQuery();
});
</script>
