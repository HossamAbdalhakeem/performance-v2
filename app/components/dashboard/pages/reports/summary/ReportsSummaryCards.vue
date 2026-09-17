<template>
  <div class="flex flex-col gap-3">
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

    <div class="grid gap-3 sm:grid-cols-2">
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
      <ReportKpiCard label="الكروت">
        <div class="mt-2 grid grid-cols-3 gap-2 text-center">
          <div>
            <p class="text-xs text-slate-400">كل</p>
            <p class="text-lg font-bold text-white">{{ cards.total ?? 0 }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400">محجوز</p>
            <p class="text-lg font-bold text-white">{{ cards.reserved ?? 0 }}</p>
          </div>
          <div>
            <p class="text-[11px] text-slate-400">متاح بيع مباشر</p>
            <p class="text-lg font-bold text-white">{{ cards.available ?? 0 }}</p>
          </div>
        </div>
      </ReportKpiCard>
    </div>
  </div>
</template>

<script setup>
import ReportKpiCard from "~/components/dashboard/pages/reports/summary/ReportKpiCard.vue";
import { formatMoney } from "~/utils/format";

defineOptions({ name: "ReportsSummaryCards" });

defineProps({
  summary: { type: Object, default: () => ({}) },
  books: { type: Object, default: () => ({}) },
  cards: { type: Object, default: () => ({}) },
});
</script>
