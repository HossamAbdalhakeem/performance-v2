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
        <AppStatusTag
          kind="stock-movement"
          :code="data.typeKey"
          :label="data.type"
        />
      </template>
      <template #status="{ data }">
        <AppStatusTag
          kind="reservation"
          :code="data.statusKey"
          :label="data.status"
        />
      </template>
    </AppDataTable>
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import PaymentProofThumb from "~/components/shared/payment-proof-thumb/index.vue";
import AppStatusTag from "~/components/shared/app-status-tag/index.vue";
import { formatMoney, formatDateTime } from "~/utils/format";
import { getPaymentMethodLabel } from "~/utils/paymentMethods";
import {
  getReservationStatusLabel,
  getStockMovementLabel,
} from "~/utils/domainLabels";

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
    { field: "status", header: "الحالة", slot: "status" },
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

const exchangeColumns = computed(() => {
  const cols = [
    { field: "time", header: "الوقت" },
    { field: "student", header: "الطالب" },
    { field: "fromProduct", header: "من منتج" },
    { field: "toProduct", header: "إلى منتج" },
    { field: "quantity", header: "الكمية" },
    { field: "difference", header: "فرق السعر" },
  ];
  if (props.isCustomerService) {
    cols.push({ field: "branch", header: "الفرع" });
  }
  cols.push({ field: "by", header: "بواسطة" });
  return cols;
});

const refundColumns = computed(() => {
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
    { field: "amount", header: "المبلغ" },
    { field: "method", header: "طريقة الاسترداد" },
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
    columns: exchangeColumns.value,
    emptyMessage: "لا توجد استبدالات في هذا اليوم.",
    kind: "exchanges",
  },
  refunds: {
    title: "عمليات الاسترداد",
    columns: refundColumns.value,
    emptyMessage: "لا توجد عمليات استرداد في هذه الفترة.",
    kind: "refunds",
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
      method: getPaymentMethodLabel(row.paymentMethod || row.method),
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
      statusKey: row.status || "",
      status: getReservationStatusLabel(row.status),
      paid: formatMoney(row.paid, "rtl"),
      method: getPaymentMethodLabel(row.paymentMethod || row.method),
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
    const sectionTypeOverride =
      props.sectionKey === "received"
        ? "STOCK_IN"
        : props.sectionKey === "stockOut"
          ? "STOCK_OUT"
          : null;

    return rows.map((row) => {
      const rawType = String(row.type || row.typeKey || "").toUpperCase();
      const qtyChange = Number(row.quantityChange ?? 0);
      const inferredType =
        sectionTypeOverride ||
        rawType ||
        (qtyChange > 0 ? "STOCK_IN" : qtyChange < 0 ? "STOCK_OUT" : "");

      return {
        time: formatDateTime(row.time, "time"),
        product: row.product || "-",
        type: getStockMovementLabel(inferredType),
        typeKey: inferredType,
        qty: row.quantityLabel ?? String(row.quantityChange ?? 0),
        by: row.by || "-",
      };
    });
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
      branch: row.branch || "-",
      by: row.by || "-",
    }));
  }

  if (kind === "refunds") {
    return rows.map((row) => ({
      time: formatDateTime(row.time, "time"),
      number: row.number || "-",
      student: row.student || "-",
      product: row.product || "-",
      branch: row.branch || "-",
      amount: formatMoney(row.amount, "rtl"),
      method: getPaymentMethodLabel(row.method),
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
