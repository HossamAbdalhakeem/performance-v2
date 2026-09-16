<template>
  <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
    <p class="mb-3 font-bold text-white">مبيعات</p>
    <div class="grid gap-2 text-sm text-slate-200">
      <p>
        مبيعات فرع:
        <strong class="text-white">{{ formatNumber(breakdown.branchSales) }}</strong>
      </p>
      <p>
        محجوزات:
        <strong class="text-white">{{ formatNumber(breakdown.reservations) }}</strong>
      </p>
      <p>
        مرتجعات:
        <strong class="text-white">{{ formatNumber(refundsTotal) }}</strong>
      </p>
      <p>
        صافي الربح:
        <strong class="text-white">{{ formatNumber(breakdown.netProfit) }}</strong>
      </p>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "ReportsSalesBreakdown" });

defineProps({
  breakdown: { type: Object, default: () => ({}) },
  refundsTotal: { type: [Number, String], default: 0 },
});

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
</script>
