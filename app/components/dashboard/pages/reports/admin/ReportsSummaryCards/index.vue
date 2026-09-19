<template>
  <div v-if="loading" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <div
      v-for="i in 4"
      :key="`kpi-skel-${i}`"
      class="rounded-xl border border-white/10 bg-slate-900 p-4"
    >
      <Skeleton width="7rem" height="0.9rem" class="mb-3" />
      <Skeleton width="60%" height="1.8rem" />
    </div>
  </div>
  <div
    v-else
    class="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
  >
    <ReportKpiCard
      compact
      label="إجمالي المبيعات"
      :value="formatMoney(summary.salesAmount, 'locale')"
      :hint="`${summary.sales ?? 0} عملية بيع`"
    />
    <ReportKpiCard
      compact
      label="إجمالي الحجوزات"
      :value="summary.reservations ?? 0"
      :hint="`مدفوع ${formatMoney(summary.reservationsPaidAmount, 'locale')}`"
    />
    <ReportKpiCard
      compact
      label="عربونات معلقة"
      :value="formatMoney(summary.reservationDeposits, 'locale')"
      hint="ليست ضمن إيراد المبيعات بعد"
    />
    <ReportKpiCard
      compact
      label="إجمالي المخزون"
      :value="summary.inventoryTotal ?? 0"
    />
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import ReportKpiCard from "./partials/ReportKpiCard.vue";
import { reportService } from "~/services/reportService";
import { formatMoney } from "~/utils/format";
import { useAdminReportSection } from "~/composables/useAdminReportSection";

defineOptions({ name: "ReportsSummaryCards" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data } = useAdminReportSection(
  (params) => reportService.getAdminKpis(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
  },
);

const summary = computed(() => data.value?.summary || {});
</script>
