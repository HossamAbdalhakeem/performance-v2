<template>
  <div
    class="rounded-xl border border-white/10 bg-slate-900"
    :class="compact ? 'p-3.5' : 'p-4'"
  >
    <p :class="compact ? 'text-sm text-slate-400' : 'text-sm text-slate-300'">
      {{ label }}
    </p>
    <slot>
      <p
        class="font-bold text-white"
        :class="compact ? 'mt-1.5 text-xl' : 'mt-2 text-2xl'"
      >
        {{ value }}
      </p>
      <p
        v-if="hint"
        class="mt-1 text-slate-500"
        :class="compact ? 'text-xs leading-snug' : 'text-xs'"
      >
        {{ hint }}
      </p>
    </slot>
  </div>
</template>

<script setup>
defineOptions({ name: "ReportKpiCard" });

defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: "" },
  hint: { type: String, default: "" },
  compact: { type: Boolean, default: false },
});
</script>
