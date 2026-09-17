<template>
  <div class="space-y-6 text-right" dir="rtl">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-white">تقرير اليوم</h2>
        <p class="mt-1 text-sm text-slate-400">
          {{
            isCustomerService
              ? "نشاطك عبر كل الفروع — اضغط أي بطاقة لعرض التفاصيل"
              : "نظرة سريعة على نشاط الفرع — اضغط أي بطاقة لعرض التفاصيل"
          }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="selectedDate"
          type="date"
          class="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
        />
        <Button
          label="تحديث"
          icon="pi pi-refresh"
          severity="secondary"
          :loading="loading"
          @click="loadReport"
        />
      </div>
    </div>

    <DailyReportSkeleton v-if="loading" />

    <template v-else>
      <div class="grid gap-4 xl:grid-cols-3">
        <DailyReportHero
          class="xl:col-span-1"
          :is-customer-service="isCustomerService"
          :payments-total="summary.paymentsTotal"
          :payments-collected="summary.paymentsCollected ?? summary.paymentsTotal"
          :refunds-total="Number(summary.refundsTotal || 0)"
          :cancelled-reservations="summary.cancelledReservations"
          :ready-reservations="summary.readyReservations"
        />
        <DailyReportActivitySection
          class="xl:col-span-2"
          :is-customer-service="isCustomerService"
          :activity="summary.activity"
          @open-detail="openDetail"
        />
      </div>

      <PaymentMethodsReport
        :items="paymentMethodItems"
        total-label="إجمالي المحصل"
      />

      <ReportsFinancialsSection
        v-if="!isCustomerService && hasFinancials"
        :financials="summary.financials"
        :reservation-deposits="summary.reservationDeposits"
        is-branch-scoped
      />

      <DailyReportInventorySection
        v-if="!isCustomerService"
        :inventory="summary.inventory"
        @open-detail="openDetail"
      />
      <DailyReportBranchesSection
        v-else
        :branches="branchBreakdown"
      />

      <DailyReportKpiGrid
        :is-customer-service="isCustomerService"
        :summary="summary"
        @open-detail="openDetail"
      />
    </template>

    <DailyReportDetailDialog
      v-if="detailVisible"
      v-model:visible="detailVisible"
      :loading="detailLoading"
      :section-key="activeDetailKey"
      :rows="activeDetailRows"
      :is-customer-service="isCustomerService"
      @close="closeDetail"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import { reportService } from "~/services/reportService";
import { useAppToast } from "~/composables/useAppToast";
import { useAuthStore } from "~/store/auth";

defineOptions({ name: "BranchDailyReportPage" });

const DailyReportSkeleton = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportSkeleton.vue"),
);
const DailyReportHero = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportHero.vue"),
);
const DailyReportActivitySection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportActivitySection.vue"),
);
const PaymentMethodsReport = defineAsyncComponent(() =>
  import("~/components/shared/payment-methods-report/index.vue"),
);
const ReportsFinancialsSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/summary/ReportsFinancialsSection.vue"),
);
const DailyReportInventorySection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportInventorySection.vue"),
);
const DailyReportBranchesSection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportBranchesSection.vue"),
);
const DailyReportKpiGrid = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportKpiGrid.vue"),
);
const DailyReportDetailDialog = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportDetailDialog.vue"),
);

const DETAIL_SECTIONS = new Set([
  "sales",
  "reservations",
  "delivered",
  "cancelled",
  "received",
  "stockOut",
  "allMovements",
  "returns",
  "exchanges",
]);

const { showError } = useAppToast();
const authStore = useAuthStore();

const loading = ref(true);
const detailLoading = ref(false);
const report = ref(null);
const detailCache = ref({});
const detailVisible = ref(false);
const activeDetailKey = ref(null);

const todayInputValue = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const selectedDate = ref(todayInputValue());

const summary = computed(() => report.value?.summary || {});

const hasFinancials = computed(
  () =>
    summary.value.financials &&
    typeof summary.value.financials === "object" &&
    Object.keys(summary.value.financials).length > 0,
);

const isCustomerService = computed(() => {
  if (report.value?.scope === "customer_service") return true;
  if (report.value?.scope === "branch") return false;

  const roles = authStore.getRoles || authStore.user?.roles || [];
  const list = Array.isArray(roles) ? roles : [roles];
  const role =
    authStore.user?.role ||
    authStore.getRole ||
    authStore.dashboardRole ||
    "";
  return (
    list.some((r) => String(r).toUpperCase() === "CUSTOMER_SERVICE") ||
    String(role).toLowerCase() === "social" ||
    String(role).toUpperCase() === "CUSTOMER_SERVICE"
  );
});

const paymentMethodItems = computed(() =>
  Array.isArray(summary.value.paymentsByMethod)
    ? summary.value.paymentsByMethod
    : [],
);

const branchBreakdown = computed(() =>
  Array.isArray(summary.value.byBranch) ? summary.value.byBranch : [],
);

const activeDetailRows = computed(() => {
  if (!activeDetailKey.value) return [];
  return detailCache.value[activeDetailKey.value] || [];
});

const dateRangeParams = () => {
  const base = selectedDate.value || todayInputValue();
  const from = new Date(`${base}T00:00:00`);
  const to = new Date(`${base}T23:59:59.999`);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
};

const openDetail = async (key) => {
  if (!DETAIL_SECTIONS.has(key)) return;

  activeDetailKey.value = key;
  detailVisible.value = true;

  if (detailCache.value[key]) return;

  detailLoading.value = true;
  try {
    const sectionPayload = await reportService.getDailyReportSection(
      key,
      dateRangeParams(),
    );
    detailCache.value = {
      ...detailCache.value,
      [key]: Array.isArray(sectionPayload?.rows) ? sectionPayload.rows : [],
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
    report.value = await reportService.getDailyReport(
      dateRangeParams(),
      "summary",
    );
  } catch (error) {
    report.value = null;
    showError(error?.message || "تعذر تحميل تقرير اليوم.");
  } finally {
    loading.value = false;
  }
};

watch(selectedDate, () => {
  loadReport();
});

onMounted(loadReport);
</script>
