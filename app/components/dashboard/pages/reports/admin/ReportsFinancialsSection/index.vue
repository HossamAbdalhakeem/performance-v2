<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <div class="mb-4">
      <p class="font-bold text-white">الأرباح والخسائر</p>
      <p class="mt-1 text-xs text-slate-400">
        إجمالي الربح = صافي المبيعات − تكلفة البضاعة، ثم صافي الربح = إجمالي
        الربح − إجمالي المصروفات
      </p>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton v-for="i in 4" :key="`fin-${i}`" height="4.5rem" />
      </div>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton v-for="i in 4" :key="`fin-row-${i}`" height="2.2rem" />
      </div>
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل بيانات الأرباح والخسائر."
      @retry="reload"
    />

    <template v-else>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReportsFinancialMetricCard
          v-for="metric in metrics"
          :key="metric.key"
          :label="metric.label"
          :value="metric.value"
          :value-class="metric.valueClass"
        />
      </div>

      <div
        class="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-200 sm:grid-cols-2 lg:grid-cols-4"
      >
        <ReportsFinancialDetailRow
          v-for="row in detailRows"
          :key="row.key"
          :label="row.label"
          :value="row.value"
          :value-class="row.valueClass"
        />
      </div>
    </template>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format";
import { reportService } from "~/services/reportService";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";

defineOptions({ name: "ReportsFinancialsSection" });

const ReportsFinancialMetricCard = defineAsyncComponent(
  () => import("./partials/ReportsFinancialMetricCard.vue"),
);
const ReportsFinancialDetailRow = defineAsyncComponent(
  () => import("./partials/ReportsFinancialDetailRow.vue"),
);

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => reportService.getAdminProfitLoss(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل بيانات الأرباح والخسائر.",
  },
);

const financials = computed(() => data.value || {});

const metrics = computed(() => [
  {
    key: "revenue",
    label: "الإيرادات (صافي المبيعات)",
    value: formatMoney(financials.value.revenue, "locale"),
    valueClass: "text-emerald-300",
  },
  {
    key: "cogs",
    label: "تكلفة البضاعة",
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
  // {
  //   key: "salesRelated",
  //   label: "مصروفات مرتبطة بالمبيعات",
  //   value: formatMoney(financials.value.salesRelatedExpenses, "locale"),
  // },

  {
    key: "totalExpenses",
    label: "إجمالي المصروفات",
    value: formatMoney(financials.value.totalExpenses, "locale"),
    valueClass: "text-amber-200",
  },
]);
</script>
