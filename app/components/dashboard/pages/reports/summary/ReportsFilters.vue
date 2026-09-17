<template>
  <div
    class="reports-filters flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end"
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
    <DateRangePicker
      class="reports-filter-item"
      label=""
      placeholder="اختر الفترة"
      :from="from"
      :to="to"
      @update:from="onFromChange"
      @update:to="onToChange"
      @change="onRangeChange"
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
import Button from "primevue/button";
import AppGlobalSelectBranch from "~/components/shared/app-global-select-branch/index.vue";
import DateRangePicker from "~/components/shared/date-range-picker/index.vue";

defineOptions({ name: "ReportsFilters" });

defineProps({
  branch: { type: [String, Number], default: "all" },
  from: { type: String, default: null },
  to: { type: String, default: null },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:branch",
  "update:from",
  "update:to",
  "change",
  "refresh",
]);

const onBranchChange = (value) => {
  emit("update:branch", value);
  emit("change");
};

const onFromChange = (value) => {
  emit("update:from", value);
};

const onToChange = (value) => {
  emit("update:to", value);
};

const onRangeChange = (payload) => {
  emit("change", payload);
};
</script>

<style scoped>
.reports-filters :deep(.reports-filter-item) {
  width: 100%;
  min-width: 0;
}

@media (min-width: 640px) {
  .reports-filters :deep(.reports-filter-item) {
    width: 14rem;
    flex: 1 1 14rem;
    max-width: 18rem;
  }
}

.reports-filters :deep(.reports-filter-item .p-select),
.reports-filters :deep(.p-select.reports-filter-item) {
  width: 100% !important;
}
</style>
