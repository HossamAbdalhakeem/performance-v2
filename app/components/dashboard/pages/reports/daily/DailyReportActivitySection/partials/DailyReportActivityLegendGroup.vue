<template>
  <div class="space-y-2">
    <p class="text-xs font-semibold tracking-wide text-slate-400">
      {{ group.label }}
    </p>
    <div class="grid gap-2.5" :class="gridClass">
      <DailyReportActivityLegendItem
        v-for="item in group.items"
        :key="item.key"
        :item="item"
        @open-detail="$emit('open-detail', $event)"
      />
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: "DailyReportActivityLegendGroup" });

const DailyReportActivityLegendItem = defineAsyncComponent(() =>
  import("./DailyReportActivityLegendItem.vue"),
);

const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
});

defineEmits(["open-detail"]);

const gridClass = computed(() => {
  const count = Array.isArray(props.group?.items) ? props.group.items.length : 0;
  if (count <= 1) return "sm:grid-cols-1";
  if (count === 2) return "sm:grid-cols-2";
  return "sm:grid-cols-2 xl:grid-cols-3";
});
</script>
