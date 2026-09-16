<template>
  <div class="space-y-6 text-right" dir="rtl">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="shrink-0 text-xl font-bold text-white">التقارير</h2>
        <p class="mt-1 text-sm text-slate-400">
          ملخص المبيعات والحجوزات والمخزون حسب الفلاتر
        </p>
      </div>
      <div class="reports-filters flex flex-row flex-wrap items-center gap-2">
        <Select
          v-model="selectedBook"
          :options="bookOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="اختيار الكتاب ▾"
          class="reports-filter-select"
          show-clear
          @update:model-value="loadReport"
        />
        <Select
          v-model="selectedBranch"
          :options="branchOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="الفرع: كل الفروع ▾"
          class="reports-filter-select reports-filter-select--branch"
          @update:model-value="loadReport"
        />
        <Select
          v-model="selectedDate"
          :options="dateOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="اختيار التاريخ ▾"
          class="reports-filter-select"
          @update:model-value="loadReport"
        />
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          :loading="loading"
          @click="loadReport"
        />
      </div>
    </div>

    <template v-if="loading">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="i in 4"
          :key="`kpi-${i}`"
          class="rounded-xl border border-white/10 bg-slate-900 p-4"
        >
          <Skeleton width="7rem" height="0.9rem" class="mb-3" />
          <Skeleton width="60%" height="1.8rem" />
        </div>
      </div>
      <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
        <Skeleton width="5rem" height="1rem" class="mb-3" />
        <Skeleton width="80%" height="0.9rem" class="mb-2" />
        <Skeleton width="70%" height="0.9rem" class="mb-2" />
        <Skeleton width="65%" height="0.9rem" />
      </div>
    </template>

    <template v-else>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
          <p class="text-sm text-slate-300">إجمالي المبيعات</p>
          <p class="mt-2 text-2xl font-bold text-white">
            {{ formatMoney(summary.salesAmount) }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            {{ summary.sales ?? 0 }} عملية بيع
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
          <p class="text-sm text-slate-300">إجمالي الحجوزات</p>
          <p class="mt-2 text-2xl font-bold text-white">
            {{ summary.reservations ?? 0 }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            مدفوع {{ formatMoney(summary.reservationsPaidAmount) }}
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
          <p class="text-sm text-slate-300">إجمالي المخزون</p>
          <p class="mt-2 text-2xl font-bold text-white">
            {{ summary.inventoryTotal ?? 0 }}
          </p>
        </div>
        <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
          <p class="text-sm text-slate-300">الكتب</p>
          <div class="mt-2 grid grid-cols-3 gap-2 text-center">
            <div>
              <p class="text-xs text-slate-400">كل</p>
              <p class="text-lg font-bold text-white">
                {{ books.total ?? 0 }}
              </p>
            </div>
            <div>
              <p class="text-xs text-slate-400">محجوز</p>
              <p class="text-lg font-bold text-white">
                {{ books.reserved ?? 0 }}
              </p>
            </div>
            <div>
              <p class="text-[11px] text-slate-400">متاح بيع مباشر</p>
              <p class="text-lg font-bold text-white">
                {{ books.available ?? 0 }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
        <p class="mb-3 font-bold text-white">مبيعات</p>
        <div class="grid gap-2 text-sm text-slate-200">
          <p>
            مبيعات فرع:
            <strong class="text-white">{{
              formatNumber(salesBreakdown.branchSales)
            }}</strong>
          </p>
          <p>
            محجوزات:
            <strong class="text-white">{{
              formatNumber(salesBreakdown.reservations)
            }}</strong>
          </p>
          <p>
            مرتجعات:
            <strong class="text-white">{{
              formatNumber(summary.refundsTotal)
            }}</strong>
          </p>
          <p>
            صافي الربح:
            <strong class="text-white">{{
              formatNumber(salesBreakdown.netProfit)
            }}</strong>
          </p>
          <p class="pt-1 text-xs text-slate-500">
            صافي المدفوعات بعد الاسترداد:
            {{ formatMoney(summary.paymentsTotal) }}
          </p>
        </div>
      </div>

      <PaymentMethodsReport
        :items="paymentMethodItems"
        total-label="إجمالي المدفوعات"
      />

      <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
        <p class="mb-4 font-bold text-white">طلاب وعملاء</p>
        <div class="grid gap-6 xl:grid-cols-2">
          <div>
            <p class="mb-3 text-center text-sm font-semibold text-white">
              عدد العملاء لكل سنة دراسية
            </p>
            <CustomersByYearChart
              :labels="customersByYearLabels"
              :values="customersByYearValues"
            />
          </div>

          <div>
            <p class="mb-3 text-center text-sm font-semibold text-white">
              طلاب كل مدرس
            </p>
            <AppDataTable
              :value="studentRows"
              :columns="studentColumns"
              empty-message="لا توجد بيانات طلاب في هذه الفترة."
            />
          </div>
        </div>
      </div>

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
import Select from "primevue/select";
import Button from "primevue/button";
import Skeleton from "primevue/skeleton";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import CustomersByYearChart from "~/components/shared/customers-by-year-chart/index.vue";
import PaymentMethodsReport from "~/components/shared/payment-methods-report/index.vue";
import { productService } from "~/services/productService";
import { branchService } from "~/services/branchService";
import { reportService } from "~/services/reportService";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "ReportsPage" });

const { showError } = useAppToast();

const selectedDate = ref("today");
const selectedBranch = ref("all");
const selectedBook = ref(null);
const loading = ref(true);
const report = ref(null);

const dateOptions = [
  { label: "اليوم", value: "today" },
  { label: "الأسبوع", value: "week" },
  { label: "الشهر", value: "month" },
];

const branchOptions = ref([{ label: "كل الفروع", value: "all" }]);
const bookOptions = ref([{ label: "كل الكتب", value: "all" }]);

const studentColumns = [
  { field: "student", header: "اسم الطالب" },
  { field: "teacher", header: "المدرس" },
  { field: "phone", header: "الموبايل" },
  { field: "product", header: "اشترى ايه" },
];

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

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ج.م`;

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

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
  if (selectedBook.value && selectedBook.value !== "all") {
    params.productId = selectedBook.value;
  }
  return params;
};

const loadFilters = async () => {
  try {
    const [branches, products] = await Promise.all([
      branchService.getBranches(),
      productService.getProducts(),
    ]);

    const branchList = Array.isArray(branches) ? branches : branches?.data || [];
    const productList = Array.isArray(products) ? products : products?.data || [];

    branchOptions.value = [
      { label: "كل الفروع", value: "all" },
      ...branchList.map((branch) => ({
        label: branch.name || branch.id,
        value: branch.id,
      })),
    ];

    bookOptions.value = [
      { label: "كل الكتب", value: "all" },
      ...productList.map((product) => ({
        label: product.name || product.title || product.id,
        value: product.id,
      })),
    ];
  } catch (error) {
    console.error("Failed to load report filters", error);
  }
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

onMounted(async () => {
  await loadFilters();
  await loadReport();
});
</script>

<style scoped>
.reports-filters {
  /* flex: 0 1 auto; */
  justify-content: flex-end;
  width: 75%;
}

.reports-filters :deep(.reports-filter-select.p-select),
.reports-filters :deep(.p-select.reports-filter-select) {
  width: 30% !important;
  min-width: 30%;
  max-width: 30%;
}


</style>
