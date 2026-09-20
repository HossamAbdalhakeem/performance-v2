<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <p class="font-bold text-white">{{ title }}</p>
        <p v-if="subtitle" class="mt-1 text-xs text-slate-400">{{ subtitle }}</p>
      </div>

      <div class="w-full sm:w-72">
        <label class="mb-1 block text-xs text-slate-400">نوع العملية</label>
        <Select
          v-model="selectedType"
          :options="typeOptions"
          option-label="label"
          option-value="value"
          placeholder="كل الأنواع"
          show-clear
          class="w-full"
          :disabled="loading"
          @update:model-value="onTypeChange"
        />
      </div>
    </div>

    <div v-if="loading && !rows.length" class="space-y-2">
      <Skeleton v-for="i in 5" :key="`ops-skel-${i}`" height="2.4rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      :message="error"
      @retry="$emit('retry')"
    />

    <ReportsSectionEmpty
      v-else-if="!loading && !displayRows.length"
      :message="emptyMessage"
    />

    <AppDataTable
      v-else
      :value="displayRows"
      :columns="resolvedColumns"
      :loading="loading"
      lazy
      paginator
      :rows="pageSize"
      :first="first"
      :total-records="totalRecords"
      :empty-message="emptyMessage"
      @page="onPage"
    >
      <template #type="{ data }">
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
          :style="{
            color: data.typeColor,
            backgroundColor: `${data.typeColor}22`,
            border: `1px solid ${data.typeColor}55`,
          }"
        >
          {{ data.type }}
        </span>
      </template>
    </AppDataTable>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import Select from "primevue/select";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";
import ReportsSectionEmpty from "~/components/dashboard/pages/reports/admin/ReportsSectionEmpty/index.vue";
import { formatDateTime, formatMoney } from "~/utils/format";
import {
  getStockMovementColor,
  getStockMovementLabel,
} from "~/utils/domainLabels";

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);

defineOptions({ name: "DailyReportOperationsSection" });

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  emptyMessage: {
    type: String,
    default: "لا توجد عمليات خلال الفترة المحددة.",
  },
  /** Map of type code → Arabic label for the filter */
  typeLabels: { type: Object, default: () => ({}) },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 15 },
  totalRecords: { type: Number, default: 0 },
  movementType: { type: String, default: null },
  showStudent: { type: Boolean, default: true },
});

const emit = defineEmits(["retry", "update:page", "update:movementType"]);

const selectedType = ref(props.movementType || null);

watch(
  () => props.movementType,
  (value) => {
    selectedType.value = value || null;
  },
);

const typeOptions = computed(() =>
  Object.entries(props.typeLabels || {}).map(([value, label]) => ({
    value,
    label,
  })),
);

const resolvedColumns = computed(() => {
  const cols = [
    { field: "time", header: "التاريخ والوقت" },
    { field: "product", header: "المنتج" },
    { field: "teacherName", header: "المدرس" },
    { field: "studyYear", header: "الصف الدراسي" },
  ];
  if (props.showStudent) {
    cols.push({ field: "studentName", header: "الطالب" });
  }
  cols.push(
    { field: "type", header: "النوع", slot: "type" },
    { field: "qty", header: "الكمية" },
    { field: "price", header: "السعر" },
    { field: "by", header: "بواسطة" },
  );
  return cols;
});

const formatMovementQty = (change) => {
  const n = Number(change || 0);
  if (!Number.isFinite(n) || change === "-" || change === "") return "-";
  return n > 0 ? `+${n}` : String(n);
};

const resolveMovementQuantity = (row = {}) => {
  if (row.quantityLabel === "-") return null;
  const type = String(
    row.type || row.typeKey || row.movementType || "",
  ).toUpperCase();
  const physical = Number(row.physicalQuantityChange ?? 0);
  const reserved = Number(row.reservedQuantityChange ?? 0);

  if (type === "RESERVATION" || type === "RESERVATION_RELEASE") {
    if (reserved !== 0) return reserved;
    const mapped = Number(row.quantityChange);
    return Number.isFinite(mapped) && mapped !== 0 ? mapped : physical;
  }

  if (row.quantityChange != null && row.quantityChange !== "") {
    return Number(row.quantityChange);
  }

  if (physical === 0 && reserved !== 0) return reserved;
  return physical;
};

const first = computed(() =>
  Math.max(0, (Number(props.page) - 1) * props.pageSize),
);

const resolveLabel = (typeKey) => {
  const custom = props.typeLabels?.[typeKey];
  if (custom) return custom;
  return getStockMovementLabel(typeKey);
};

const displayRows = computed(() =>
  (Array.isArray(props.rows) ? props.rows : []).map((row) => {
    const rawType = String(
      row.type || row.typeKey || row.movementType || "",
    ).toUpperCase();
    const qtyChange = resolveMovementQuantity(row);
    const inferredType =
      rawType ||
      (qtyChange > 0 ? "STOCK_IN" : qtyChange < 0 ? "STOCK_OUT" : "");

    return {
      time: formatDateTime(row.time || row.createdAt, "datetime"),
      product: row.product?.name || row.product || "-",
      teacherName: row.teacherName || "-",
      studyYear: row.studyYear || "-",
      studentName: row.studentName || "-",
      type: resolveLabel(inferredType),
      typeKey: inferredType,
      typeColor: getStockMovementColor(inferredType),
      qty:
        row.quantityLabel ??
        (qtyChange == null ? "-" : formatMovementQty(qtyChange)),
      price: formatMoney(row.price ?? 0, "locale"),
      by: row.by || row.createdBy?.fullName || row.createdBy?.name || "-",
    };
  }),
);

const onTypeChange = (value) => {
  emit("update:movementType", value || null);
};

const onPage = (event) => {
  const nextPage = Math.floor(Number(event?.first || 0) / props.pageSize) + 1;
  emit("update:page", nextPage);
};
</script>
