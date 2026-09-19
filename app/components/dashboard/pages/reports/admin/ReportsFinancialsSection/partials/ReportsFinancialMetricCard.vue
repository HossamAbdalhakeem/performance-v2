<template>
  <div class="min-w-0 rounded-lg border border-white/5 bg-slate-950/60 p-3">
    <p class="truncate text-xs text-slate-400">{{ label }}</p>
    <p class="mt-1 break-words text-xl font-bold" :class="valueClass">
      {{ value }}
    </p>
  </div>
</template>

<script setup>
defineOptions({ name: "ReportsFinancialMetricCard" });

defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: "" },
  valueClass: { type: String, default: "text-white" },
});
</script>
