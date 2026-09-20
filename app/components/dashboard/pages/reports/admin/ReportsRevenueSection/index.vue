<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <div class="mb-4">
      <p class="font-bold text-white">المبيعات والإيرادات</p>
      <p class="mt-1 text-xs text-slate-400">
        صافي المبيعات = إجمالي المبيعات − المرتجعات
      </p>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Skeleton v-for="i in 3" :key="`rev-${i}`" height="4.5rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      :message="error"
      @retry="reload"
    />

    <ReportsSectionEmpty
      v-else-if="isEmpty"
      message="لا توجد مبيعات خلال الفترة المحددة."
    />

    <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <ReportsFinancialMetricCard
        label="إجمالي المبيعات"
        :value="formatMoney(revenue.grossSales, 'locale')"
        value-class="text-emerald-300"
      />
      <ReportsFinancialMetricCard
        label="المرتجعات"
        :value="formatMoney(revenue.returns, 'locale')"
        value-class="text-rose-300"
      />
      <ReportsFinancialMetricCard
        label="صافي المبيعات"
        :value="formatMoney(revenue.netSales, 'locale')"
        value-class="text-white"
      />
    </div>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import ReportsFinancialMetricCard from "~/components/dashboard/pages/reports/admin/ReportsFinancialsSection/partials/ReportsFinancialMetricCard.vue";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";
import ReportsSectionEmpty from "~/components/dashboard/pages/reports/admin/ReportsSectionEmpty/index.vue";
import { reportService } from "~/services/reportService";
import { formatMoney } from "~/utils/format";
import { useAdminReportSection } from "~/composables/useAdminReportSection";

defineOptions({ name: "ReportsRevenueSection" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => reportService.getAdminRevenue(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل بيانات المبيعات والإيرادات.",
  },
);

const revenue = computed(() => data.value || {});
const isEmpty = computed(
  () =>
    !data.value ||
    (!(revenue.value.grossSales || 0) && !(revenue.value.returns || 0)),
);
</script>
