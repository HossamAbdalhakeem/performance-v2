<template>
  <div
    class="reports-filters relative flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end"
  >
    <ProductSelect
      :model-value="book"
      source="catalog"
      variant="simple"
      label=""
      placeholder="اختيار الكتاب"
      show-clear
      wrapper-class="reports-filter-item"
      @update:model-value="onBookChange"
    />
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
      :model-value="period"
      :options="periodOptions"
      option-label="label"
      option-value="value"
      placeholder="الفترة"
      class="reports-filter-item w-full"
      @update:model-value="onPeriodChange"
    >
      <template #value="{ placeholder: valuePlaceholder }">
        <span>{{ selectedPeriodLabel || valuePlaceholder }}</span>
      </template>
    </Select>

    <!-- Hidden host: only the overlay opens; no extra filter input in the bar -->
    <div class="reports-custom-range-host" aria-hidden="true">
      <DateRangePicker
        ref="customRangeRef"
        label=""
        placeholder="اختر التاريخ المخصص"
        :from="from"
        :to="to"
        @update:from="onFromChange"
        @update:to="onToChange"
        @change="onRangeChange"
      />
    </div>

    <Button
      icon="pi pi-refresh"
      severity="secondary"
      class="reports-refresh-btn w-full shrink-0 sm:w-auto"
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
import DateRangePicker from "~/components/shared/date-range-picker/index.vue";

defineOptions({ name: "ReportsFilters" });

const props = defineProps({
  book: { type: [String, Number], default: null },
  branch: { type: [String, Number], default: "all" },
  from: { type: String, default: null },
  to: { type: String, default: null },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:book",
  "update:branch",
  "update:from",
  "update:to",
  "change",
  "refresh",
]);

const customRangeRef = ref(null);
const period = ref("year");

const periodOptions = [
  { label: "يوم", value: "day" },
  { label: "اسبوع", value: "week" },
  { label: "شهر", value: "month" },
  { label: "سنة", value: "year" },
  { label: "تاريخ مخصص", value: "custom" },
];

const formatDisplayDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return String(iso);
  return `${y}/${m}/${d}`;
};

const customRangeLabel = computed(() => {
  if (props.from && props.to) {
    return `${formatDisplayDate(props.from)} - ${formatDisplayDate(props.to)}`;
  }
  if (props.from) return formatDisplayDate(props.from);
  return "";
});

const selectedPeriodLabel = computed(() => {
  if (period.value === "custom") {
    return customRangeLabel.value || "تاريخ مخصص";
  }
  return (
    periodOptions.find((option) => option.value === period.value)?.label || ""
  );
});

const toIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const startOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const rangeForPeriod = (value) => {
  const today = startOfToday();
  const to = toIsoDate(today);

  if (value === "day") {
    return { from: to, to };
  }

  if (value === "week") {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { from: toIsoDate(from), to };
  }

  if (value === "month") {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: toIsoDate(from), to };
  }

  if (value === "year") {
    const from = new Date(today.getFullYear(), 0, 1);
    return { from: toIsoDate(from), to };
  }

  return null;
};

const applyPreset = (value) => {
  const range = rangeForPeriod(value);
  if (!range) return;
  emit("update:from", range.from);
  emit("update:to", range.to);
  emit("change", range);
};

const openCustomPicker = async () => {
  await nextTick();
  customRangeRef.value?.open?.();
};

const onBookChange = (value) => {
  emit("update:book", value ?? null);
  emit("change");
};

const onBranchChange = (value) => {
  emit("update:branch", value);
  emit("change");
};

const onPeriodChange = async (value) => {
  period.value = value || "year";

  if (period.value === "custom") {
    await openCustomPicker();
    return;
  }

  applyPreset(period.value);
};

const onFromChange = (value) => {
  emit("update:from", value);
};

const onToChange = (value) => {
  emit("update:to", value);
};

const onRangeChange = (payload) => {
  period.value = "custom";
  emit("change", payload);
};

const detectPeriodFromProps = () => {
  const from = props.from;
  const to = props.to;
  if (!from || !to) {
    period.value = "year";
    return;
  }

  for (const option of ["day", "week", "month", "year"]) {
    const range = rangeForPeriod(option);
    if (range && range.from === from && range.to === to) {
      period.value = option;
      return;
    }
  }

  period.value = "custom";
};

onMounted(() => {
  detectPeriodFromProps();
  if (period.value === "custom") return;
  if (!props.from || !props.to) {
    applyPreset(period.value);
  }
});
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

.reports-filters :deep(.reports-refresh-btn.p-button) {
  width: 100%;
  min-height: 2.75rem;
  height: 2.75rem;
  padding-inline: 0.9rem;
}

@media (min-width: 640px) {
  .reports-filters :deep(.reports-refresh-btn.p-button) {
    width: 2.75rem;
    min-width: 2.75rem;
  }
}

.reports-custom-range-host {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}
</style>
