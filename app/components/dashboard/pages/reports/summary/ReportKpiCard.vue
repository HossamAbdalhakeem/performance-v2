<template>
  <div class="rounded-xl border border-white/10 bg-slate-900 p-4">
    <p class="text-sm text-slate-300">{{ label }}</p>
    <slot>
      <p class="mt-2 text-2xl font-bold text-white">{{ value }}</p>
      <p v-if="hint" class="mt-1 text-xs text-slate-500">{{ hint }}</p>
    </slot>
  </div>
</template>

<script setup>
defineOptions({ name: "ReportKpiCard" });

defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: "" },
  hint: { type: String, default: "" },
});
</script>
