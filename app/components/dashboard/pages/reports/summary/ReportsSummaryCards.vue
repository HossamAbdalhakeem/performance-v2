<template>
  <div class="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
import ReportKpiCard from "~/components/dashboard/pages/reports/summary/ReportKpiCard.vue";
import { formatMoney } from "~/utils/format";

defineOptions({ name: "ReportsSummaryCards" });

defineProps({
  summary: { type: Object, default: () => ({}) },
});
</script>
