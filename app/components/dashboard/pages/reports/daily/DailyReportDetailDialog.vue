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
    >
      <template #method="{ data }">
        <PaymentProofThumb
          :method="data.paymentMethod"
          :method-label="data.method"
          :payment-id="data.paymentId"
          :proof-url="data.proofUrl"
          :has-proof="data.hasProof"
        />
      </template>
      <template #type="{ data }">
        <span
          class="inline-flex rounded-md px-2 py-1 text-xs font-bold"
          :class="movementTypeClass(data.typeKey)"
        >
          {{ data.type }}
        </span>
      </template>
    </AppDataTable>
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import PaymentProofThumb from "~/components/shared/payment-proof-thumb/index.vue";
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
  { field: "type", header: "النوع", slot: "type" },
  { field: "qty", header: "الكمية" },
  { field: "by", header: "بواسطة" },
];

const MOVEMENT_TYPE_CLASS = {
  STOCK_IN: "bg-teal-500/20 text-teal-300",
  STOCK_OUT: "bg-orange-500/20 text-orange-300",
  SALE: "bg-sky-500/20 text-sky-300",
  RESERVATION: "bg-amber-500/20 text-amber-300",
  RESERVATION_RELEASE: "bg-rose-500/20 text-rose-300",
  RETURN: "bg-fuchsia-500/20 text-fuchsia-300",
  DAMAGED: "bg-red-500/20 text-red-300",
  ADJUSTMENT: "bg-violet-500/20 text-violet-300",
  EXCHANGE: "bg-indigo-500/20 text-indigo-300",
};

const movementTypeClass = (typeKey) =>
  MOVEMENT_TYPE_CLASS[String(typeKey || "").toUpperCase()] ||
  "bg-slate-500/20 text-slate-300";

const saleColumns = [
  { field: "time", header: "الوقت" },
  { field: "student", header: "الطالب" },
  { field: "products", header: "المنتجات" },
  { field: "amount", header: "المبلغ" },
  { field: "method", header: "الدفع", slot: "method" },
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
    { field: "method", header: "الدفع", slot: "method" },
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

const returnColumns = [
  { field: "time", header: "الوقت" },
  { field: "student", header: "الطالب" },
  { field: "products", header: "المنتجات" },
  { field: "quantity", header: "الكمية" },
  { field: "refund", header: "المسترد" },
  { field: "by", header: "بواسطة" },
];

const exchangeColumns = [
  { field: "time", header: "الوقت" },
  { field: "student", header: "الطالب" },
  { field: "fromProduct", header: "من منتج" },
  { field: "toProduct", header: "إلى منتج" },
  { field: "quantity", header: "الكمية" },
  { field: "difference", header: "فرق السعر" },
  { field: "by", header: "بواسطة" },
];

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
  undelivered: {
    title: "حجوزات لم تستلم",
    columns: reservationColumns.value,
    emptyMessage: "لا توجد حجوزات غير مستلمة في هذا اليوم.",
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
  returns: {
    title: "المرتجعات",
    columns: returnColumns,
    emptyMessage: "لا توجد مرتجعات في هذا اليوم.",
    kind: "returns",
  },
  exchanges: {
    title: "الاستبدالات",
    columns: exchangeColumns,
    emptyMessage: "لا توجد استبدالات في هذا اليوم.",
    kind: "exchanges",
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
      method: row.paymentMethodLabel || row.method || "-",
      paymentMethod: row.paymentMethod || "",
      paymentId: row.paymentId || null,
      proofUrl: row.proofUrl || null,
      hasProof: Boolean(row.hasProof),
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
      method: row.paymentMethodLabel || row.method || "-",
      paymentMethod: row.paymentMethod || "",
      paymentId: row.paymentId || null,
      proofUrl: row.proofUrl || null,
      hasProof: Boolean(row.hasProof),
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
      typeKey: row.type || row.typeKey || "",
      qty: row.quantityLabel ?? String(row.quantityChange ?? 0),
      by: row.by || "-",
    }));
  }

  if (kind === "returns") {
    return rows.map((row) => ({
      time: formatDateTime(row.time, "time"),
      student: row.student || "-",
      products: row.products || "-",
      quantity: row.quantity ?? 0,
      refund: formatMoney(row.refund, "rtl"),
      by: row.by || "-",
    }));
  }

  if (kind === "exchanges") {
    return rows.map((row) => ({
      time: formatDateTime(row.time, "time"),
      student: row.student || "-",
      fromProduct: row.fromProduct || "-",
      toProduct: row.toProduct || "-",
      quantity: row.quantity ?? 0,
      difference: formatMoney(row.difference, "rtl"),
      by: row.by || "-",
    }));
  }

  return rows;
});

const onVisibleUpdate = (value) => {
  emit("update:visible", value);
  if (!value) emit("close");
};
</script>
