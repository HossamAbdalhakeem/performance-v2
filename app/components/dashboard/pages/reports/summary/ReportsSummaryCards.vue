<template>
  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
    <ReportKpiCard
      label="إجمالي المبيعات"
      :value="formatMoney(summary.salesAmount, 'locale')"
      :hint="`${summary.sales ?? 0} عملية بيع`"
    />
    <ReportKpiCard
      label="إجمالي الحجوزات"
      :value="summary.reservations ?? 0"
      :hint="`مدفوع ${formatMoney(summary.reservationsPaidAmount, 'locale')}`"
    />
    <ReportKpiCard
      label="عربونات معلقة"
      :value="formatMoney(summary.reservationDeposits, 'locale')"
      hint="ليست ضمن إيراد المبيعات بعد"
    />
    <ReportKpiCard
      label="إجمالي المخزون"
      :value="summary.inventoryTotal ?? 0"
    />
    <ReportKpiCard label="الكتب">
      <div class="mt-2 grid grid-cols-3 gap-2 text-center">
        <div>
          <p class="text-xs text-slate-400">كل</p>
          <p class="text-lg font-bold text-white">{{ books.total ?? 0 }}</p>
        </div>
        <div>
          <p class="text-xs text-slate-400">محجوز</p>
          <p class="text-lg font-bold text-white">{{ books.reserved ?? 0 }}</p>
        </div>
        <div>
          <p class="text-[11px] text-slate-400">متاح بيع مباشر</p>
          <p class="text-lg font-bold text-white">{{ books.available ?? 0 }}</p>
        </div>
      </div>
    </ReportKpiCard>
  </div>
</template>

<script setup>
import ReportKpiCard from "~/components/dashboard/pages/reports/summary/ReportKpiCard.vue";
import { formatMoney } from "~/utils/format";

defineOptions({ name: "ReportsSummaryCards" });

defineProps({
  summary: { type: Object, default: () => ({}) },
  books: { type: Object, default: () => ({}) },
});
</script>
