<template>
  <div class="space-y-6 text-right" dir="rtl">
    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div class="min-w-0">
        <h2 class="shrink-0 text-xl font-bold text-white">التقارير</h2>
        <p class="mt-1 text-sm text-slate-400">
          ملخص المبيعات والحجوزات والمخزون حسب الفلاتر
        </p>
      </div>
      <ReportsFilters
        v-model:book="selectedBook"
        v-model:branch="selectedBranch"
        v-model:date="selectedDate"
        :loading="loading"
        class="w-full sm:w-auto sm:max-w-full sm:flex-1"
        @change="loadReport"
        @refresh="loadReport"
      />
    </div>

    <ReportsLoadingSkeleton v-if="loading" />

    <template v-else>
      <ReportsSummaryCards :summary="summary" :books="books" />

      <ReportsSalesBreakdown
        :breakdown="salesBreakdown"
        :refunds-total="summary.refundsTotal"
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

const ReportsLoadingSkeleton = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/summary/ReportsLoadingSkeleton.vue"),
);
const ReportsSummaryCards = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/summary/ReportsSummaryCards.vue"),
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

defineOptions({ name: "ReportsPage" });

const { showError } = useAppToast();

const selectedDate = ref("today");
const selectedBranch = ref("all");
const selectedBook = ref(null);
const loading = ref(true);
const report = ref(null);

const summary = computed(() => report.value?.summary || {});
const books = computed(() => summary.value.books || {});
const salesBreakdown = computed(() => summary.value.salesBreakdown || {});

const paymentMethodItems = computed(() =>
  Array.isArray(summary.value.paymentsByMethod)
    ? summary.value.paymentsByMethod
    : [],
);

const customersByYearLabels = computed(() =>
  (report.value?.customersByYear || []).map((row) => row.label),
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
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  if (selectedDate.value === "week") {
    from.setDate(from.getDate() - 6);
  } else if (selectedDate.value === "month") {
    from.setDate(1);
  }

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
};

const reportParams = () => {
  const params = { ...dateRangeParams() };
  if (selectedBranch.value && selectedBranch.value !== "all") {
    params.branchId = selectedBranch.value;
  }
  if (selectedBook.value) {
    params.productId = selectedBook.value;
  }
  return params;
};

const loadReport = async () => {
  loading.value = true;
  try {
    report.value = await reportService.getDailyReport(reportParams(), "summary");
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
  const rows = [
    ["اسم الطالب", "المدرس", "الموبايل", "اشترى ايه"],
    ...studentRows.value.map((row) => [
      row.student,
      row.teacher,
      row.phone,
      row.product,
    ]),
    [],
    ["إجمالي المبيعات", s.salesAmount ?? 0],
    ["عدد عمليات البيع", s.sales ?? 0],
    ["إجمالي الحجوزات", s.reservations ?? 0],
    ["مدفوعات الحجوزات", s.reservationsPaidAmount ?? 0],
    ["إجمالي المخزون", s.inventoryTotal ?? 0],
    ["مبيعات فرع", breakdown.branchSales ?? 0],
    ["محجوزات", breakdown.reservations ?? 0],
    ["مرتجعات", s.refundsTotal ?? 0],
    ["صافي الربح", breakdown.netProfit ?? 0],
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
