<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <div class="mb-4 flex flex-wrap items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="font-bold text-white">الأرباح والخسائر</p>
        <p class="mt-1 text-xs text-slate-400">
          الإيرادات − تكلفة البضاعة = إجمالي الربح، ثم خصم المصروفات المرتبطة
        </p>
      </div>
      <p
        v-if="isBranchScoped"
        class="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-200"
      >
        صافي ربح الفرع لا يشمل المصروفات العامة
      </p>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Skeleton v-for="i in 4" :key="`fin-${i}`" height="4.5rem" />
      </div>
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton v-for="i in 3" :key="`fin-row-${i}`" height="2.2rem" />
      </div>
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل بيانات الأرباح والخسائر."
      @retry="reload"
    />

    <ReportsSectionEmpty
      v-else-if="isEmpty"
      message="لا توجد بيانات أرباح وخسائر خلال الفترة المحددة."
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
    </template>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format";
import { reportService } from "~/services/reportService";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";
import ReportsSectionEmpty from "~/components/dashboard/pages/reports/admin/ReportsSectionEmpty/index.vue";

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

const isEmpty = computed(
  () =>
    !data.value ||
    (!(financials.value.revenue || 0) &&
      !(financials.value.cogs || 0) &&
      !(financials.value.salesRelatedExpenses || 0) &&
      !(financials.value.generalExpenses || 0)),
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
    key: "salesRelated",
    label: "مصروفات مرتبطة بالمبيعات",
    value: formatMoney(financials.value.salesRelatedExpenses, "locale"),
  },
  {
    key: "generalExpenses",
    label: "مصروفات عامة (منفصلة)",
    value: formatMoney(financials.value.generalExpenses, "locale"),
    hint: "(لا تُخصم تلقائياً من صافي الربح)",
  },
]);
</script>
