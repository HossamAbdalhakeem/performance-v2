<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    :header="sectionMeta?.title || 'التفاصيل'"
    :style="{ width: '920px', maxWidth: '96vw' }"
    :pt="{
      header: { class: 'text-right' },
      content: { class: 'text-right' },
    }"
    @update:visible="onVisibleUpdate"
  >
    <AppDataTable
      v-if="visible && sectionMeta"
      :value="displayRows"
      :columns="sectionMeta.columns"
      :loading="loading"
      paginator
      :rows="20"
      :empty-message="sectionMeta.emptyMessage"
    />
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import { formatMoney, formatDateTime } from "~/utils/format";

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);

defineOptions({ name: "DailyReportDetailDialog" });

const props = defineProps({
  visible: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  sectionKey: { type: String, default: null },
  rows: { type: Array, default: () => [] },
  isCustomerService: { type: Boolean, default: false },
});

const emit = defineEmits(["update:visible", "close"]);

const movementColumns = [
  { field: "time", header: "الوقت" },
  { field: "product", header: "المنتج" },
  { field: "type", header: "النوع" },
  { field: "qty", header: "الكمية" },
  { field: "by", header: "بواسطة" },
  { field: "note", header: "ملاحظة" },
];

const saleColumns = [
  { field: "time", header: "الوقت" },
  { field: "student", header: "الطالب" },
  { field: "products", header: "المنتجات" },
  { field: "amount", header: "المبلغ" },
  { field: "method", header: "الدفع" },
  { field: "by", header: "بواسطة" },
];

const reservationColumns = computed(() => {
  const cols = [
    { field: "time", header: "الوقت" },
    { field: "number", header: "رقم الحجز" },
    { field: "student", header: "الطالب" },
    { field: "product", header: "المنتج" },
  ];
  if (props.isCustomerService) {
    cols.push({ field: "branch", header: "الفرع" });
  }
  cols.push(
    { field: "status", header: "الحالة" },
    { field: "paid", header: "المدفوع" },
    { field: "by", header: "بواسطة" },
  );
  return cols;
});

const deliveredColumns = computed(() => {
  const cols = [
    { field: "time", header: "وقت التسليم" },
    { field: "number", header: "رقم الحجز" },
    { field: "student", header: "الطالب" },
    { field: "product", header: "المنتج" },
  ];
  if (props.isCustomerService) {
    cols.push({ field: "branch", header: "الفرع" });
  }
  cols.push({ field: "by", header: "بواسطة" });
  return cols;
});

const cancelledColumns = computed(() => {
  const cols = [
    { field: "time", header: "وقت الإلغاء" },
    { field: "number", header: "رقم الحجز" },
    { field: "student", header: "الطالب" },
    { field: "product", header: "المنتج" },
  ];
  if (props.isCustomerService) {
    cols.push({ field: "branch", header: "الفرع" });
  }
  cols.push(
    { field: "paid", header: "المدفوع" },
    { field: "refund", header: "المسترد" },
    { field: "by", header: "بواسطة" },
  );
  return cols;
});

const SECTION_META = computed(() => ({
  sales: {
    title: "المبيعات",
    columns: saleColumns,
    emptyMessage: "لا توجد مبيعات في هذا اليوم.",
    kind: "sales",
  },
  reservations: {
    title: "الحجوزات الجديدة",
    columns: reservationColumns.value,
    emptyMessage: "لا توجد حجوزات جديدة في هذا اليوم.",
    kind: "reservations",
  },
  delivered: {
    title: "الحجوزات المسلّمة",
    columns: deliveredColumns.value,
    emptyMessage: "لا توجد حجوزات مسلّمة في هذا اليوم.",
    kind: "delivered",
  },
  cancelled: {
    title: "الحجوزات الملغاة",
    columns: cancelledColumns.value,
    emptyMessage: "لا توجد حجوزات ملغاة في هذا اليوم.",
    kind: "cancelled",
  },
  received: {
    title: "المنتجات المستلمة (وارد)",
    columns: movementColumns,
    emptyMessage: "لا توجد عمليات استلام في هذا اليوم.",
    kind: "movement",
  },
  stockOut: {
    title: "المنتجات المسحوبة",
    columns: movementColumns,
    emptyMessage: "لا توجد عمليات سحب مخزون في هذا اليوم.",
    kind: "movement",
  },
  allMovements: {
    title: "كل حركات المخزن",
    columns: movementColumns,
    emptyMessage: "لا توجد حركات مخزن في هذا اليوم.",
    kind: "movement",
  },
}));

const sectionMeta = computed(() =>
  props.sectionKey ? SECTION_META.value[props.sectionKey] || null : null,
);

const displayRows = computed(() => {
  const kind = sectionMeta.value?.kind;
  const rows = Array.isArray(props.rows) ? props.rows : [];

  if (kind === "sales") {
    return rows.map((row) => ({
      time: formatDateTime(row.time, "time"),
      student: row.student || "-",
      products: row.products || "-",
      amount: formatMoney(row.amount, "rtl"),
      method: row.method || "-",
      by: row.by || "-",
    }));
  }

  if (kind === "reservations") {
    return rows.map((row) => ({
      time: formatDateTime(row.time, "time"),
      number: row.number || "-",
      student: row.student || "-",
      product: row.product || "-",
      branch: row.branch || "-",
      status: row.statusLabel || row.status || "-",
      paid: formatMoney(row.paid, "rtl"),
      by: row.by || "-",
    }));
  }

  if (kind === "delivered") {
    return rows.map((row) => ({
      time: formatDateTime(row.time, "time"),
      number: row.number || "-",
      student: row.student || "-",
      product: row.product || "-",
      branch: row.branch || "-",
      by: row.by || "-",
    }));
  }

  if (kind === "cancelled") {
    return rows.map((row) => ({
      time: formatDateTime(row.time, "time"),
      number: row.number || "-",
      student: row.student || "-",
      product: row.product || "-",
      branch: row.branch || "-",
      paid: formatMoney(row.paid, "rtl"),
      refund: formatMoney(row.refund, "rtl"),
      by: row.by || "-",
    }));
  }

  if (kind === "movement") {
    return rows.map((row) => ({
      time: formatDateTime(row.time, "time"),
      product: row.product || "-",
      type: row.typeLabel || row.type || "-",
      qty: row.quantityLabel ?? String(row.quantityChange ?? 0),
      by: row.by || "-",
      note: row.note || "-",
    }));
  }

  return rows;
});

const onVisibleUpdate = (value) => {
  emit("update:visible", value);
  if (!value) emit("close");
};
</script>
