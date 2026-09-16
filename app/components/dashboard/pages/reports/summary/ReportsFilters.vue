<template>
  <div class="reports-filters flex flex-row flex-wrap items-center gap-2">
    <ProductSelect
      :model-value="book"
      source="catalog"
      variant="simple"
      label=""
      placeholder="اختيار الكتاب ▾"
      show-clear
      wrapper-class="reports-filter-select"
      @update:model-value="onBookChange"
    />
    <AppGlobalSelectBranch
      :model-value="branch"
      label=""
      placeholder="الفرع: كل الفروع ▾"
      include-all-option
      all-option-label="كل الفروع"
      all-option-value="all"
      select-class="reports-filter-select reports-filter-select--branch"
      @update:model-value="onBranchChange"
    />
    <Select
      :model-value="date"
      :options="dateOptions"
      optionLabel="label"
      optionValue="value"
      placeholder="اختيار التاريخ ▾"
      class="reports-filter-select"
      @update:model-value="onDateChange"
    />
    <Button
      icon="pi pi-refresh"
      severity="secondary"
      :loading="loading"
      @click="$emit('refresh')"
    />
  </div>
</template>

<script setup>
import Select from "primevue/select";
import Button from "primevue/button";
import ProductSelect from "~/components/shared/product-select/index.vue";
import AppGlobalSelectBranch from "~/components/shared/app-global-select-branch/index.vue";

defineOptions({ name: "ReportsFilters" });

defineProps({
  book: { type: [String, Number], default: null },
  branch: { type: [String, Number], default: "all" },
  date: { type: String, default: "today" },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:book",
  "update:branch",
  "update:date",
  "change",
  "refresh",
]);

const dateOptions = [
  { label: "اليوم", value: "today" },
  { label: "الأسبوع", value: "week" },
  { label: "الشهر", value: "month" },
];

const onBookChange = (value) => {
  emit("update:book", value);
  emit("change");
};

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
.reports-filters {
  justify-content: flex-end;
  width: 75%;
}

.reports-filters :deep(.reports-filter-select.p-select),
.reports-filters :deep(.p-select.reports-filter-select) {
  width: 30% !important;
  min-width: 30%;
  max-width: 30%;
}
</style>
