<template>
  <div class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4">
    <p class="mb-3 font-bold text-white">مبيعات ومدفوعات</p>
    <div class="grid gap-2 text-sm text-slate-200">
      <p class="min-w-0 break-words">
        مبيعات فرع:
        <strong class="text-white">{{ formatNumber(breakdown.branchSales) }}</strong>
      </p>
      <p class="min-w-0 break-words">
        مدفوعات الحجوزات (كل الحالات):
        <strong class="text-white">{{ formatNumber(breakdown.reservations) }}</strong>
      </p>
      <p class="min-w-0 break-words">
        عربونات حجوزات معلّقة:
        <strong class="text-amber-200">
          {{ formatNumber(breakdown.reservationDeposits ?? reservationDeposits) }}
        </strong>
      </p>
      <p class="min-w-0 break-words">
        مرتجعات:
        <strong class="text-white">{{ formatNumber(refundsTotal) }}</strong>
      </p>
      <p class="min-w-0 break-words">
        صافي الربح:
        <strong class="text-white">
          {{ formatNumber(netProfit) }}
        </strong>
      </p>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "ReportsSalesBreakdown" });

const props = defineProps({
  breakdown: { type: Object, default: () => ({}) },
  refundsTotal: { type: [Number, String], default: 0 },
  reservationDeposits: { type: [Number, String], default: 0 },
  financials: { type: Object, default: null },
});

const netProfit = computed(() =>
  props.financials?.netProfit ?? props.breakdown?.netProfit ?? 0,
);

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
</script>
