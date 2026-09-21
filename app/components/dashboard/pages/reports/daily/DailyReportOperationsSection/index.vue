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
        <span class="ops-tag" :style="tagStyle(data.typeColor)">
          {{ data.type }}
        </span>
      </template>

      <template #product="{ data }">
        <ProductCell :product="data.productObj" />
      </template>

      <template #newProduct="{ data }">
        <ProductCell :product="data.newProductObj" />
      </template>

      <template #qty="{ data }">
        <span class="ops-tag tabular-nums" :style="tagStyle(METRIC_COLORS.qty)">
          {{ data.qty }}
        </span>
      </template>

      <template #price="{ data }">
        <span class="ops-tag tabular-nums" :style="tagStyle(METRIC_COLORS.price)">
          {{ data.price }}
        </span>
      </template>

      <template #paidAmount="{ data }">
        <span class="ops-tag tabular-nums" :style="tagStyle(METRIC_COLORS.paid)">
          {{ data.paidAmount }}
        </span>
      </template>

      <template #remainingAmount="{ data }">
        <span
          class="ops-tag tabular-nums"
          :style="
            tagStyle(
              data.remainingRaw > 0
                ? METRIC_COLORS.remaining
                : METRIC_COLORS.remainingZero,
            )
          "
        >
          {{ data.remainingAmount }}
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
import ProductCell from "~/components/shared/product-cell/index.vue";
import { formatDateTime, formatMoney } from "~/utils/format";
import {
  DEFAULT_METRIC_COLOR,
  STOCK_MOVEMENT_COLORS,
  getStockMovementColor,
  getStockMovementLabel,
} from "~/utils/domainLabels";

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);

defineOptions({ name: "DailyReportOperationsSection" });

/** Same chip palette as type tags (STOCK_MOVEMENT_COLORS). */
const METRIC_COLORS = {
  qty: STOCK_MOVEMENT_COLORS.STOCK_IN,
  price: STOCK_MOVEMENT_COLORS.SALE,
  newPrice: STOCK_MOVEMENT_COLORS.RESERVATION,
  paid: STOCK_MOVEMENT_COLORS.STOCK_IN,
  remaining: STOCK_MOVEMENT_COLORS.RETURN,
  remainingZero: DEFAULT_METRIC_COLOR,
};

const tagStyle = (color) => {
  const c = color || DEFAULT_METRIC_COLOR;
  return {
    color: c,
    backgroundColor: `${c}22`,
    border: `1px solid ${c}55`,
  };
};

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
  /** sales | exchanges | refunds | stock — controls columns */
  variant: { type: String, default: "sales" },
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

const isSales = computed(
  () => props.variant === "sales" || props.variant === "student",
);
const isExchanges = computed(
  () => props.variant === "exchanges" || props.variant === "adjustments",
);
const isRefunds = computed(() => props.variant === "refunds");

const resolvedColumns = computed(() => {
  if (isExchanges.value) {
    return [
      { field: "time", header: "التاريخ والوقت" },
      { field: "type", header: "النوع", slot: "type" },
      { field: "studentName", header: "الطالب" },
      { field: "product", header: "المنتج", slot: "product" },
      { field: "newProduct", header: "المنتج الجديد", slot: "newProduct" },
      { field: "price", header: "الفرق", slot: "price" },
      { field: "qty", header: "الكمية", slot: "qty" },
    ];
  }

  if (isRefunds.value) {
    return [
      { field: "time", header: "التاريخ والوقت" },
      { field: "type", header: "النوع", slot: "type" },
      { field: "studentName", header: "الطالب" },
      { field: "product", header: "المنتج", slot: "product" },
      { field: "price", header: "مبلغ الاسترداد", slot: "price" },
      { field: "qty", header: "الكمية", slot: "qty" },
    ];
  }

  if (isSales.value) {
    return [
      { field: "time", header: "التاريخ والوقت" },
      { field: "type", header: "النوع", slot: "type" },
      { field: "studentName", header: "الطالب" },
      { field: "product", header: "المنتج", slot: "product" },
      { field: "qty", header: "الكمية", slot: "qty" },
      { field: "paidAmount", header: "المدفوع", slot: "paidAmount" },
      { field: "remainingAmount", header: "المتبقي", slot: "remainingAmount" },
      { field: "by", header: "بواسطة" },
    ];
  }

  return [
    { field: "time", header: "التاريخ والوقت" },
    { field: "type", header: "النوع", slot: "type" },
    { field: "product", header: "المنتج", slot: "product" },
    { field: "qty", header: "الكمية", slot: "qty" },
    { field: "price", header: "السعر", slot: "price" },
  ];
});

const first = computed(() =>
  Math.max(0, (Number(props.page) - 1) * props.pageSize),
);

const resolveLabel = (typeKey) => {
  const custom = props.typeLabels?.[typeKey];
  if (custom) return custom;
  return getStockMovementLabel(typeKey);
};

const moneyLabel = (value) => {
  if (value == null || value === "") return null;
  return formatMoney(value, "locale");
};

const moneyOrDash = (value) => moneyLabel(value) || "-";

/** Shape ProductCell expects: { name, price?, teacherName?, studyYearName?, priceColor? } */
const toProductCell = (product, options = {}) => {
  const name = product?.name || null;
  if (!name) return null;

  const priceValue =
    options.price ?? product?.price ?? product?.sellingPrice ?? null;
  const teacherName =
    options.teacherName ||
    product?.teacher?.name ||
    product?.teacherName ||
    null;
  const studyYearName =
    product?.studyYear?.name || product?.studyYearName || null;

  return {
    name,
    price: moneyLabel(priceValue),
    teacherName: teacherName || null,
    studyYearName: studyYearName || null,
    priceColor: options.priceColor || STOCK_MOVEMENT_COLORS.SALE,
  };
};

const displayRows = computed(() =>
  (Array.isArray(props.rows) ? props.rows : []).map((row) => {
    const typeKey = String(row.type || "").toUpperCase();
    const product = row.product || row.oldProduct || null;
    const newProduct = row.newProduct || null;
    const teacher = row.teacher || product?.teacher || null;
    const student = row.student || null;
    const qty = Number(row.quantity ?? 0);
    const remainingRaw = Number(row.remainingAmount ?? 0);

    return {
      time: formatDateTime(row.createdAt || row.time, "datetime"),
      productObj: toProductCell(product, {
        teacherName: teacher?.name || null,
        price:
          row.oldProduct?.price ??
          row.oldProduct?.sellingPrice ??
          product?.price ??
          product?.sellingPrice ??
          null,
      }),
      newProductObj: toProductCell(newProduct, {
        priceColor: STOCK_MOVEMENT_COLORS.EXCHANGE_SALE,
      }),
      studentName: student?.name || "-",
      paidAmount: moneyOrDash(row.paidAmount),
      remainingAmount: moneyOrDash(row.remainingAmount),
      remainingRaw: Number.isFinite(remainingRaw) ? remainingRaw : 0,
      type: resolveLabel(typeKey),
      typeKey,
      typeColor: getStockMovementColor(typeKey),
      qty: Number.isFinite(qty) ? Math.abs(qty) : 0,
      price: moneyOrDash(
        row.differenceAmount ?? row.refundAmount ?? row.price,
      ),
      by: row.createdBy?.fullName || row.createdBy?.name || "-",
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

<style scoped>
.ops-tag {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 9999px;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.25rem;
}
</style>
