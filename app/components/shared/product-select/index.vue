<template>
  <div class="flex flex-col gap-2 text-right" :class="wrapperClass">
    <label v-if="label" class="text-sm font-medium" :class="labelClass">{{ label }}</label>

    <Select
      :model-value="modelValue"
      :options="resolvedOptions"
      option-label="label"
      option-value="value"
      :placeholder="placeholder"
      filter
      :filter-fields="filterFields"
      :loading="isLoading"
      :disabled="disabled || isLoading || !canSelect"
      :show-clear="showClear"
      :invalid="invalid"
      class="w-full product-select"
      :class="{ 'p-invalid': invalid }"
      @update:model-value="onUpdate"
    >
      <template v-if="variant === 'rich'" #value="{ placeholder: valuePlaceholder }">
        <div v-if="selectedOption" class="w-full py-0.5 text-right">
          <div class="flex items-start justify-between gap-3">
            <span class="font-medium text-slate-100">{{ selectedOption.name }}</span>
            <span
              v-if="selectedOption.availabilityLabel"
              class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="
                selectedOption.isAvailable
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-200'
              "
            >
              {{ selectedOption.availabilityLabel }}
            </span>
          </div>
          <div class="mt-0.5 flex items-center justify-between gap-3">
            <p v-if="selectedOption.teacherName" class="text-xs text-slate-400">
              مقدم من أ/ {{ selectedOption.teacherName }}
            </p>
            <span
              v-if="selectedOption.priceLabel"
              class="text-xs"
              :class="selectedOption.isSellingPrice ? 'text-sky-300' : 'text-amber-200'"
            >
              {{ selectedOption.priceKindLabel }} {{ selectedOption.priceLabel }}
            </span>
          </div>
        </div>
        <span v-else>{{ valuePlaceholder }}</span>
      </template>

      <template v-if="variant === 'rich'" #option="{ option }">
        <div class="w-full py-1 text-right">
          <div class="flex items-start justify-between gap-3">
            <span class="font-medium">{{ option.name }}</span>
            <span
              v-if="option.availabilityLabel"
              class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
              :class="
                option.isAvailable
                  ? 'bg-emerald-500/15 text-emerald-700'
                  : 'bg-amber-500/15 text-amber-700'
              "
            >
              {{ option.availabilityLabel }}
            </span>
          </div>
          <div class="mt-0.5 flex items-center justify-between gap-3">
            <p v-if="option.teacherName" class="text-xs text-slate-400">
              مقدم من أ/ {{ option.teacherName }}
            </p>
            <span
              v-if="option.priceLabel"
              class="shrink-0 text-sm"
              :class="option.isSellingPrice ? 'text-sky-600' : 'text-amber-700'"
            >
              {{ option.priceKindLabel }} {{ option.priceLabel }}
            </span>
          </div>
        </div>
      </template>
    </Select>

    <small v-if="hint" class="text-xs text-slate-400">{{ hint }}</small>
  </div>
</template>

<script setup>
import Select from "primevue/select";
import { inventoryService } from "~/services/inventoryService";
import { productService } from "~/services/productService";
import {
  mapCatalogProductOption,
  mapInventoryProductOptions,
} from "~/utils/productOptions";
import { useAppToast } from "~/composables/useAppToast";

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  options: { type: Array, default: null },
  label: { type: String, default: "المنتج" },
  placeholder: { type: String, default: "اختر المنتج" },
  hint: { type: String, default: "" },
  invalid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  showClear: { type: Boolean, default: false },
  variant: {
    type: String,
    default: "rich",
    validator: (value) => ["rich", "simple"].includes(value),
  },
  source: {
    type: String,
    default: "options",
    validator: (value) => ["options", "inventory", "catalog"].includes(value),
  },
  branchId: { type: [String, Number], default: null },
  inventoryQuery: { type: Object, default: () => ({}) },
  excludeProductId: { type: [String, Number], default: null },
  minAvailableQuantity: { type: Number, default: 0 },
  reservationOnly: { type: Boolean, default: false },
  autoLoad: { type: Boolean, default: true },
  filterFields: {
    type: Array,
    default: () => ["name", "teacherName", "label"],
  },
  wrapperClass: { type: String, default: "" },
  labelClass: { type: String, default: "text-slate-700" },
});

const emit = defineEmits([
  "update:modelValue",
  "select",
  "change",
  "loaded",
  "loading",
]);

const { showError } = useAppToast();

const internalOptions = ref([]);
const internalLoading = ref(false);

const isLoading = computed(() => props.loading || internalLoading.value);

const canSelect = computed(() => {
  if (props.source === "inventory") return Boolean(props.branchId);
  return true;
});

const resolvedOptions = computed(() => {
  if (props.source === "options" || props.options != null) {
    return props.options || [];
  }
  return internalOptions.value;
});

const selectedOption = computed(
  () =>
    resolvedOptions.value.find((option) => option.value === props.modelValue) ||
    null,
);

const onUpdate = (value) => {
  emit("update:modelValue", value);
  const option =
    resolvedOptions.value.find((item) => item.value === value) || null;
  emit("select", option);
  emit("change", value, option);
};

const loadInventoryOptions = async () => {
  if (!props.branchId) {
    internalOptions.value = [];
    emit("loaded", []);
    return;
  }

  internalLoading.value = true;
  emit("loading", true);
  try {
    const items = await inventoryService.getBranchInventory(
      props.branchId,
      props.inventoryQuery || {},
    );
    const mapped = mapInventoryProductOptions(items, {
      excludeProductId: props.excludeProductId,
      minAvailableQuantity: props.minAvailableQuantity,
    });
    internalOptions.value = mapped;
    emit("loaded", mapped);
  } catch (error) {
    internalOptions.value = [];
    emit("loaded", []);
    showError(error?.message || "تعذر تحميل المنتجات.");
  } finally {
    internalLoading.value = false;
    emit("loading", false);
  }
};

const loadCatalogOptions = async () => {
  internalLoading.value = true;
  emit("loading", true);
  try {
    const result = await productService.getProducts({ per_page: 20 });
    const list = result?.data || result || [];
    const mapped = list
      .map((product) =>
        mapCatalogProductOption(product, {
          reservationOnly: props.reservationOnly,
        }),
      )
      .filter(Boolean)
      .filter(
        (option) =>
          !props.excludeProductId || option.value !== props.excludeProductId,
      );
    internalOptions.value = mapped;
    emit("loaded", mapped);
  } catch (error) {
    internalOptions.value = [];
    emit("loaded", []);
    showError(error?.message || "تعذر تحميل المنتجات.");
  } finally {
    internalLoading.value = false;
    emit("loading", false);
  }
};

const reload = async () => {
  if (props.source === "inventory") {
    await loadInventoryOptions();
    return;
  }
  if (props.source === "catalog") {
    await loadCatalogOptions();
  }
};

watch(
  () => [
    props.source,
    props.branchId,
    props.excludeProductId,
    props.minAvailableQuantity,
    JSON.stringify(props.inventoryQuery || {}),
    props.reservationOnly,
  ],
  () => {
    if (!props.autoLoad) return;
    if (props.source === "options") return;
    reload();
  },
  { immediate: true },
);

defineExpose({
  reload,
  selectedOption,
  options: resolvedOptions,
});
</script>
