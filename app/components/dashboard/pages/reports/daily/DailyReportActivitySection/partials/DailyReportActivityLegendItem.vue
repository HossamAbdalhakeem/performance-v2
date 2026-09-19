<template>
  <button
    type="button"
    class="flex w-full items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2.5 text-right transition"
    :disabled="!clickable"
    :class="
      clickable
        ? 'cursor-pointer hover:border-white/20 hover:bg-slate-950/70'
        : 'cursor-default opacity-80'
    "
    @click="onClick"
  >
    <div class="flex min-w-0 items-center gap-2">
      <span
        class="h-2.5 w-2.5 shrink-0 rounded-full"
        :style="{ backgroundColor: item.color }"
      />
      <span class="truncate text-sm text-slate-300">{{ item.label }}</span>
    </div>
    <div class="flex shrink-0 items-baseline gap-2">
      <span class="text-sm font-bold text-white">{{ item.value }}</span>
    </div>
  </button>
</template>

<script setup>
defineOptions({ name: "DailyReportActivityLegendItem" });

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["open-detail"]);

const clickable = computed(
  () => Boolean(props.item?.sectionKey) && Number(props.item?.value || 0) > 0,
);

const onClick = () => {
  if (!clickable.value) return;
  emit("open-detail", props.item.sectionKey);
};
</script>
