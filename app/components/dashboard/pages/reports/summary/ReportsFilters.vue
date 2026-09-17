<template>
  <div
    class="reports-filters flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end"
  >
    <AppGlobalSelectBranch
      :model-value="branch"
      label=""
      placeholder="كل الفروع"
      include-all-option
      all-option-label="كل الفروع"
      all-option-value="all"
      wrapper-class="reports-filter-item"
      select-class="w-full"
      @update:model-value="onBranchChange"
    />
    <Select
      :model-value="date"
      :options="dateOptions"
      optionLabel="label"
      optionValue="value"
      placeholder="اختيار التاريخ"
      class="reports-filter-item w-full"
      @update:model-value="onDateChange"
    />
    <Button
      icon="pi pi-refresh"
      severity="secondary"
      class="w-full shrink-0 sm:w-auto"
      :loading="loading"
      @click="$emit('refresh')"
    />
  </div>
</template>

<script setup>
import Select from "primevue/select";
import Button from "primevue/button";
import AppGlobalSelectBranch from "~/components/shared/app-global-select-branch/index.vue";

defineOptions({ name: "ReportsFilters" });

defineProps({
  branch: { type: [String, Number], default: "all" },
  date: { type: String, default: "today" },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["update:branch", "update:date", "change", "refresh"]);

const dateOptions = [
  { label: "اليوم", value: "today" },
  { label: "الأسبوع", value: "week" },
  { label: "الشهر", value: "month" },
];

const onBranchChange = (value) => {
  emit("update:branch", value);
  emit("change");
};

const onDateChange = (value) => {
  emit("update:date", value);
  emit("change");
};
</script>

<style scoped>
.reports-filters :deep(.reports-filter-item) {
  width: 100%;
  min-width: 0;
}

@media (min-width: 640px) {
  .reports-filters :deep(.reports-filter-item) {
    width: 12rem;
    flex: 1 1 12rem;
    max-width: 16rem;
  }
}

.reports-filters :deep(.reports-filter-item .p-select),
.reports-filters :deep(.p-select.reports-filter-item) {
  width: 100% !important;
}
</style>
