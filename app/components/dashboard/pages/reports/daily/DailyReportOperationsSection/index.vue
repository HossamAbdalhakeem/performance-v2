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

      <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
        <ReportOperationTypeFilter
          v-model="selectedType"
          :labels="typeFilterLabels"
          :disabled="loading"
          @change="onTypeChange"
        />
        <ReportStatusFilter
          v-if="isSales"
          v-model="selectedStatus"
          :options="statusOptions"
          :disabled="loading"
          @change="onStatusChange"
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
      <template #time="{ data }">
        <AppDateTimeCell :value="data.createdAt" />
      </template>

      <template #type="{ data }">
        <span class="ops-tag" :style="tagStyle(data.typeColor)">
          {{ data.type }}
        </span>
      </template>

      <template #status="{ data }">
        <span class="ops-tag" :style="tagStyle(data.statusColor)">
          {{ data.statusLabel }}
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

      <template #totalAmount="{ data }">
        <span class="ops-tag tabular-nums" :style="tagStyle(METRIC_COLORS.price)">
          {{ data.totalAmount }}
        </span>
      </template>

      <template #history="{ data }">
        <Button
          v-if="data.historyCount > 0"
          v-tooltip.top="'سجل الاستبدال'"
          icon="pi pi-history"
          text
          rounded
          severity="secondary"
          aria-label="سجل الاستبدال"
          @click="openHistory(data)"
        />
        <span v-else class="text-slate-500">—</span>
      </template>
    </AppDataTable>

    <Dialog
      v-model:visible="historyVisible"
      modal
      dir="rtl"
      :header="historyDialogTitle"
      :style="{ width: 'min(920px, 96vw)' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    >
      <AppDataTable
        :value="historyRows"
        :columns="historyColumns"
        empty-message="لا يوجد سجل استبدال."
      >
        <template #time="{ data }">
          <AppDateTimeCell :value="data.createdAt" />
        </template>
        <template #oldProduct="{ data }">
          <ProductCell :product="data.oldProductObj" />
        </template>
        <template #newProduct="{ data }">
          <ProductCell :product="data.newProductObj" />
        </template>
        <template #paid="{ data }">
          <span class="ops-tag tabular-nums" :style="tagStyle(METRIC_COLORS.paid)">
            {{ data.paidLabel }}
          </span>
        </template>
        <template #diff="{ data }">
          <span class="ops-tag tabular-nums" :style="tagStyle(METRIC_COLORS.price)">
            {{ data.diffLabel }}
          </span>
        </template>
        <template #qty="{ data }">
          <span class="ops-tag tabular-nums" :style="tagStyle(METRIC_COLORS.qty)">
            {{ data.qty }}
          </span>
        </template>
      </AppDataTable>
    </Dialog>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";
import ReportsSectionEmpty from "~/components/dashboard/pages/reports/admin/ReportsSectionEmpty/index.vue";
import ProductCell from "~/components/shared/product-cell/index.vue";
import AppDateTimeCell from "~/components/shared/app-datetime-cell/index.vue";
import ReportOperationTypeFilter from "~/components/shared/report-operation-type-filter/index.vue";
import ReportStatusFilter from "~/components/shared/report-status-filter/index.vue";
import { formatMoney } from "~/utils/format";
import {
  DEFAULT_METRIC_COLOR,
  STOCK_MOVEMENT_COLORS,
  getOperationStatusColor,
  getOperationStatusLabel,
  getStockMovementColor,
  getStockMovementLabel,
  getStudentOperationLabel,
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
  /** Map of type code → Arabic label (row chips + fallback filter) */
  typeLabels: { type: Object, default: () => ({}) },
  /** Optional shorter map for the type filter only */
  filterLabels: { type: Object, default: null },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 15 },
  totalRecords: { type: Number, default: 0 },
  movementType: { type: String, default: null },
  operationStatus: { type: String, default: null },
  /** Status filter options: [{ value, label }] — passed from parent */
  statusOptions: { type: Array, default: () => [] },
  /** sales | exchanges | refunds | stock — controls columns */
  variant: { type: String, default: "sales" },
});

const emit = defineEmits([
  "retry",
  "update:page",
  "update:movementType",
  "update:operationStatus",
]);

const selectedType = ref(props.movementType || null);
const selectedStatus = ref(props.operationStatus || null);
const historyVisible = ref(false);
const historyContext = ref(null);

watch(
  () => props.movementType,
  (value) => {
    selectedType.value = value || null;
  },
);

watch(
  () => props.operationStatus,
  (value) => {
    selectedStatus.value = value || null;
  },
);

const typeFilterLabels = computed(() => {
  if (props.filterLabels && Object.keys(props.filterLabels).length) {
    return props.filterLabels;
  }
  return props.typeLabels || {};
});

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
      { field: "createdAt", header: "التاريخ والوقت", slot: "time" },
      { field: "type", header: "النوع", slot: "type" },
      { field: "studentName", header: "الطالب" },
      { field: "reservationNumber", header: "رقم الحجز" },
      { field: "product", header: "المنتج", slot: "product" },
      { field: "newProduct", header: "المنتج الجديد", slot: "newProduct" },
      { field: "paidAmount", header: "المدفوع", slot: "paidAmount" },
      { field: "remainingAmount", header: "المتبقي", slot: "remainingAmount" },
      { field: "price", header: "الفرق", slot: "price" },
      { field: "qty", header: "الكمية", slot: "qty" },
      { field: "by", header: "بواسطة" },
      {
        field: "history",
        header: "السجل",
        slot: "history",
        style: "width: 4.5rem",
      },
    ];
  }

  if (isRefunds.value) {
    return [
      { field: "createdAt", header: "التاريخ والوقت", slot: "time" },
      { field: "type", header: "النوع", slot: "type" },
      { field: "studentName", header: "الطالب" },
      { field: "operationNumber", header: "رقم العملية" },
      { field: "product", header: "المنتج", slot: "product" },
      { field: "paidAmount", header: "المدفوع", slot: "paidAmount" },
      { field: "price", header: "مبلغ الاسترداد", slot: "price" },
      { field: "qty", header: "الكمية", slot: "qty" },
      { field: "by", header: "بواسطة" },
    ];
  }

  if (isSales.value) {
    return [
      { field: "createdAt", header: "التاريخ والوقت", slot: "time" },
      { field: "type", header: "النوع", slot: "type" },
      { field: "studentName", header: "الطالب" },
      { field: "product", header: "المنتج", slot: "product" },
      { field: "qty", header: "الكمية", slot: "qty" },
      { field: "paidAmount", header: "المدفوع", slot: "paidAmount" },
      { field: "remainingAmount", header: "المتبقي", slot: "remainingAmount" },
      { field: "totalAmount", header: "الإجمالي", slot: "totalAmount" },
      { field: "statusLabel", header: "الحالة", slot: "status" },
      { field: "by", header: "بواسطة" },
    ];
  }

  return [
    { field: "createdAt", header: "التاريخ والوقت", slot: "time" },
    { field: "type", header: "النوع", slot: "type" },
    { field: "product", header: "المنتج", slot: "product" },
    { field: "qty", header: "الكمية", slot: "qty" },
    { field: "price", header: "السعر", slot: "price" },
  ];
});

const historyColumns = [
  { field: "createdAt", header: "التاريخ والوقت", slot: "time" },
  { field: "oldProduct", header: "المنتج القديم", slot: "oldProduct" },
  { field: "newProduct", header: "المنتج الجديد", slot: "newProduct" },
  { field: "paidLabel", header: "المدفوع", slot: "paid" },
  { field: "diffLabel", header: "الفرق", slot: "diff" },
  { field: "qty", header: "الكمية", slot: "qty" },
  { field: "by", header: "بواسطة" },
];

const first = computed(() =>
  Math.max(0, (Number(props.page) - 1) * props.pageSize),
);

const resolveLabel = (typeKey) => {
  const custom = props.typeLabels?.[typeKey];
  if (custom) return custom;
  return (
    getStudentOperationLabel(typeKey) || getStockMovementLabel(typeKey)
  );
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
    const history = Array.isArray(row.history) ? row.history : [];

    return {
      createdAt: row.createdAt || row.time || null,
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
      reservationNumber:
        row.reservation?.reservationNumber ||
        row.reservationNumber ||
        row.operationNumber ||
        "—",
      operationNumber: row.operationNumber || row.reservationNumber || "—",
      paidAmount: moneyOrDash(row.paidAmount),
      paidAmountRaw:
        row.paidAmount == null || row.paidAmount === ""
          ? null
          : Number(row.paidAmount),
      remainingAmount: moneyOrDash(row.remainingAmount),
      totalAmount: moneyOrDash(row.totalAmount),
      remainingRaw: Number.isFinite(remainingRaw) ? remainingRaw : 0,
      type: resolveLabel(typeKey),
      typeKey,
      typeColor: getStockMovementColor(typeKey),
      statusKey: row.operationStatus || null,
      statusLabel:
        row.operationStatusLabel ||
        getOperationStatusLabel(row.operationStatus) ||
        "—",
      statusColor: getOperationStatusColor(row.operationStatus),
      qty: Number.isFinite(qty) ? Math.abs(qty) : 0,
      price: moneyOrDash(
        row.differenceAmount ?? row.refundAmount ?? row.price,
      ),
      by: row.createdBy?.fullName || row.createdBy?.name || "-",
      history,
      historyCount: Number(row.historyCount ?? history.length) || 0,
    };
  }),
);

const historyDialogTitle = computed(() => {
  const number = historyContext.value?.reservationNumber;
  if (number && number !== "—") return `سجل استبدال الحجز ${number}`;
  return "سجل الاستبدال";
});

const historyRows = computed(() => {
  const hops = historyContext.value?.history || [];
  return hops.map((hop) => ({
    createdAt: hop.createdAt || null,
    oldProductObj: toProductCell(hop.oldProduct, {
      price: hop.oldProduct?.price ?? hop.oldProduct?.sellingPrice ?? null,
    }),
    newProductObj: toProductCell(hop.newProduct, {
      price: hop.newProduct?.price ?? hop.newProduct?.sellingPrice ?? null,
      priceColor: STOCK_MOVEMENT_COLORS.EXCHANGE_SALE,
    }),
    paidLabel: moneyOrDash(
      hop.paidAmount ?? historyContext.value?.paidAmountRaw ?? null,
    ),
    diffLabel: moneyOrDash(hop.differenceAmount),
    qty: Math.abs(Number(hop.quantity ?? 0)),
    by: hop.createdBy?.fullName || hop.createdBy?.name || "—",
  }));
});

const openHistory = (row) => {
  historyContext.value = row;
  historyVisible.value = true;
};

const onTypeChange = (value) => {
  emit("update:movementType", value || null);
};

const onStatusChange = (value) => {
  emit("update:operationStatus", value || null);
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
