<template>
  <div class="flex w-full min-w-0 flex-col gap-3">
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

    <div class="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
      <ReportKpiCard label="الكتب">
        <div class="mt-2 grid grid-cols-3 gap-1 text-center sm:gap-2">
          <div class="min-w-0">
            <p class="truncate text-xs text-slate-400">كل</p>
            <p class="truncate text-base font-bold text-white sm:text-lg">
              {{ books.total ?? 0 }}
            </p>
          </div>
          <div class="min-w-0">
            <p class="truncate text-xs text-slate-400">محجوز</p>
            <p class="truncate text-base font-bold text-white sm:text-lg">
              {{ books.reserved ?? 0 }}
            </p>
          </div>
          <div class="min-w-0">
            <p class="truncate text-[11px] text-slate-400">متاح بيع مباشر</p>
            <p class="truncate text-base font-bold text-white sm:text-lg">
              {{ books.available ?? 0 }}
            </p>
          </div>
        </div>
      </ReportKpiCard>
      <ReportKpiCard label="الكروت">
        <div class="mt-2 grid grid-cols-3 gap-1 text-center sm:gap-2">
          <div class="min-w-0">
            <p class="truncate text-xs text-slate-400">كل</p>
            <p class="truncate text-base font-bold text-white sm:text-lg">
              {{ cards.total ?? 0 }}
            </p>
          </div>
          <div class="min-w-0">
            <p class="truncate text-xs text-slate-400">محجوز</p>
            <p class="truncate text-base font-bold text-white sm:text-lg">
              {{ cards.reserved ?? 0 }}
            </p>
          </div>
          <div class="min-w-0">
            <p class="truncate text-[11px] text-slate-400">متاح بيع مباشر</p>
            <p class="truncate text-base font-bold text-white sm:text-lg">
              {{ cards.available ?? 0 }}
            </p>
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
