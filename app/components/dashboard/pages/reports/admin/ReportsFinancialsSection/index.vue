<template>
  <div
    v-if="loading"
    class="rounded-xl border border-white/10 bg-slate-900 p-4"
  >
    <Skeleton width="8rem" height="1rem" class="mb-4" />
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Skeleton v-for="i in 4" :key="`fin-${i}`" height="4.5rem" />
    </div>
  </div>
  <div
    v-else
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
  >
    <div class="mb-4 flex flex-wrap items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="font-bold text-white">الأرباح والخسائر</p>
        <p class="mt-1 text-xs text-slate-400">
          الإيرادات − تكلفة البضاعة = إجمالي الربح، ثم خصم المصروفات
        </p>
      </div>
      <p
        v-if="isBranchScoped"
        class="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-200"
      >
        صافي ربح الفرع لا يشمل المصروفات العامة
      </p>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ReportsFinancialMetricCard
        v-for="metric in metrics"
        :key="metric.key"
        :label="metric.label"
        :value="metric.value"
        :value-class="metric.valueClass"
      />
    </div>

    <div class="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-200 sm:grid-cols-2 lg:grid-cols-3">
      <ReportsFinancialDetailRow
        v-for="row in detailRows"
        :key="row.key"
        :label="row.label"
        :value="row.value"
        :value-class="row.valueClass"
        :hint="row.hint"
      />
    </div>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format";
import { reportService } from "~/services/reportService";
import { useAdminReportSection } from "~/composables/useAdminReportSection";

defineOptions({ name: "ReportsFinancialsSection" });

const ReportsFinancialMetricCard = defineAsyncComponent(() =>
  import("./partials/ReportsFinancialMetricCard.vue"),
);
const ReportsFinancialDetailRow = defineAsyncComponent(() =>
  import("./partials/ReportsFinancialDetailRow.vue"),
);

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
  isBranchScoped: { type: Boolean, default: false },
});

const emit = defineEmits(["loading"]);

const { loading, data } = useAdminReportSection(
  (params) => reportService.getFinancialReport(params).catch(() => null),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
  },
);

const financials = computed(() => {
  const fromFinancial = data.value?.financials;
  if (!fromFinancial) return {};
  return {
    ...fromFinancial,
    branchExpenses: fromFinancial.academicYearExpenses,
    operatingExpenses: fromFinancial.academicYearExpenses,
    generalExpenses: data.value?.separate?.generalExpenses ?? 0,
  };
});

const breakdown = computed(() => data.value?.breakdown || {});
const refundsTotal = computed(() => data.value?.refundsTotal ?? 0);
const reservationDeposits = computed(
  () =>
    data.value?.separate?.reservationDeposits ??
    data.value?.breakdown?.reservationDeposits ??
    0,
);
const separateGeneralExpenses = computed(
  () => data.value?.separate?.generalExpenses ?? 0,
);

const metrics = computed(() => [
  {
    key: "revenue",
    label: "الإيرادات (صافي المبيعات)",
    value: formatMoney(financials.value.revenue, "locale"),
    valueClass: "text-emerald-300",
  },
  {
    key: "cogs",
    label: "تكلفة البضاعة (COGS)",
    value: formatMoney(financials.value.cogs, "locale"),
    valueClass: "text-rose-300",
  },
  {
    key: "grossProfit",
    label: "إجمالي الربح",
    value: formatMoney(financials.value.grossProfit, "locale"),
    valueClass: "text-sky-300",
  },
  {
    key: "netProfit",
    label: "صافي الربح",
    value: formatMoney(financials.value.netProfit, "locale"),
    valueClass: "text-white",
  },
]);

const detailRows = computed(() => [
  {
    key: "branchSales",
    label: "مبيعات فرع",
    value: formatMoney(breakdown.value.branchSales, "locale"),
  },
  {
    key: "reservations",
    label: "مدفوعات الحجوزات (كل الحالات)",
    value: formatMoney(breakdown.value.reservations, "locale"),
  },
  {
    key: "refunds",
    label: "مرتجعات",
    value: formatMoney(refundsTotal.value, "locale"),
  },
  {
    key: "linkedExpenses",
    label: "مصروفات مرتبطة",
    value: formatMoney(
      financials.value.academicYearExpenses ?? financials.value.branchExpenses,
      "locale",
    ),
  },
  {
    key: "generalExpenses",
    label: "مصروفات عامة (منفصلة)",
    value: formatMoney(separateGeneralExpenses.value, "locale"),
    hint: "(لا تُخصم تلقائياً من صافي الربح)",
  },
  {
    key: "reservationDeposits",
    label: "عربونات الحجوزات (منفصلة عن الإيرادات)",
    value: formatMoney(reservationDeposits.value, "locale"),
    valueClass: "text-amber-200",
  },
]);
</script>
