<template>
  <div class="space-y-6 text-right" dir="rtl">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-white">تقرير اليوم</h2>
        <p class="mt-1 text-sm text-slate-400">
          اضغط على أي بطاقة لعرض التفاصيل
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="selectedDate"
          type="date"
          class="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
        />
        <Button
          label="تحديث"
          icon="pi pi-refresh"
          severity="secondary"
          :loading="loading"
          @click="loadReport"
        />
      </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <button
        v-for="card in summaryCards"
        :key="card.key"
        type="button"
        class="rounded-xl border border-white/10 bg-slate-900 p-4 text-right transition"
        :class="
          card.clickable
            ? 'cursor-pointer hover:border-sky-400/50 hover:bg-slate-800/80'
            : 'cursor-default opacity-95'
        "
        :disabled="!card.clickable"
        @click="card.clickable && openDetail(card.key)"
      >
        <div class="flex items-start justify-between gap-2">
          <p class="text-sm text-slate-300">{{ card.label }}</p>
          <i
            v-if="card.clickable"
            class="pi pi-external-link text-xs text-slate-500"
          />
        </div>
        <p class="mt-2 text-2xl font-bold text-white">{{ card.value }}</p>
      </button>
    </div>

    <Dialog
      v-model:visible="detailVisible"
      modal
      dir="rtl"
      :header="activeDetail?.title || 'التفاصيل'"
      :style="{ width: '920px', maxWidth: '96vw' }"
      :pt="{
        header: { class: 'text-right' },
        content: { class: 'text-right' },
      }"
      @hide="closeDetail"
    >
      <AppDataTable
        v-if="activeDetail"
        :value="activeDetail.rows"
        :columns="activeDetail.columns"
        :loading="loading"
        paginator
        :rows="10"
        :empty-message="activeDetail.emptyMessage"
      />
    </Dialog>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import { reportService } from "~/services/reportService";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "BranchDailyReportPage" });

const { showError } = useAppToast();

const MOVEMENT_LABELS = {
  STOCK_IN: "استلام",
  STOCK_OUT: "سحب",
  SALE: "بيع",
  RESERVATION: "حجز",
  RESERVATION_RELEASE: "إلغاء حجز",
  RETURN: "مرتجع",
  DAMAGED: "تالف",
  ADJUSTMENT: "تسوية",
};

const STATUS_LABELS = {
  PENDING: "قيد الانتظار",
  WAITING_FOR_STOCK: "بانتظار المخزون",
  READY: "جاهز",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

const loading = ref(false);
const report = ref(null);
const detailVisible = ref(false);
const activeDetailKey = ref(null);

const todayInputValue = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const selectedDate = ref(todayInputValue());

const formatMoney = (value) =>
  `\u2066${Number(value || 0).toFixed(2)} ج.م\u2069`;

const formatTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const dateRangeParams = () => {
  const base = selectedDate.value || todayInputValue();
  const from = new Date(`${base}T00:00:00`);
  const to = new Date(`${base}T23:59:59.999`);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
};

const mapMovement = (item) => ({
  time: formatTime(item.createdAt),
  product: item.product?.name || "-",
  type: MOVEMENT_LABELS[item.movementType] || item.movementType,
  qty:
    item.physicalQuantityChange > 0
      ? `+${item.physicalQuantityChange}`
      : String(item.physicalQuantityChange ?? 0),
  by: item.createdBy?.fullName || "-",
  note: item.note || "-",
});

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

const reservationColumns = [
  { field: "time", header: "الوقت" },
  { field: "number", header: "رقم الحجز" },
  { field: "student", header: "الطالب" },
  { field: "product", header: "المنتج" },
  { field: "status", header: "الحالة" },
  { field: "paid", header: "المدفوع" },
  { field: "by", header: "بواسطة" },
];

const deliveredColumns = [
  { field: "time", header: "وقت التسليم" },
  { field: "number", header: "رقم الحجز" },
  { field: "student", header: "الطالب" },
  { field: "product", header: "المنتج" },
  { field: "by", header: "بواسطة" },
];

const receivedRows = computed(() =>
  (report.value?.receivedProducts || []).map(mapMovement),
);
const stockOutRows = computed(() =>
  (report.value?.stockOutProducts || []).map(mapMovement),
);
const allMovementRows = computed(() =>
  (report.value?.stockMovements || []).map(mapMovement),
);

const saleRows = computed(() =>
  (report.value?.sales || []).map((sale) => ({
    time: formatTime(sale.createdAt),
    student: sale.student?.name || "-",
    products: (sale.items || [])
      .map((item) => `${item.product?.name || "-"} × ${item.quantity}`)
      .join("، "),
    amount: formatMoney(sale.totalAmount),
    method: (sale.payments || [])
      .map((p) => p.method)
      .filter(Boolean)
      .join(" / ") || "-",
    by: sale.createdBy?.fullName || "-",
  })),
);

const reservationRows = computed(() =>
  (report.value?.reservations || []).map((item) => ({
    time: formatTime(item.createdAt),
    number: item.reservationNumber || "-",
    student: item.student?.name || "-",
    product: item.product?.name || "-",
    status: STATUS_LABELS[item.status] || item.status,
    paid: formatMoney(item.paidAmount),
    by: item.createdBy?.fullName || "-",
  })),
);

const deliveredRows = computed(() =>
  (report.value?.deliveredReservations || []).map((item) => ({
    time: formatTime(item.updatedAt),
    number: item.reservationNumber || "-",
    student: item.student?.name || "-",
    product: item.product?.name || "-",
    by: item.createdBy?.fullName || "-",
  })),
);

const detailSections = computed(() => ({
  sales: {
    title: "المبيعات",
    rows: saleRows.value,
    columns: saleColumns,
    emptyMessage: "لا توجد مبيعات في هذا اليوم.",
  },
  reservations: {
    title: "الحجوزات الجديدة",
    rows: reservationRows.value,
    columns: reservationColumns,
    emptyMessage: "لا توجد حجوزات جديدة في هذا اليوم.",
  },
  delivered: {
    title: "الحجوزات المسلّمة",
    rows: deliveredRows.value,
    columns: deliveredColumns,
    emptyMessage: "لا توجد حجوزات مسلّمة في هذا اليوم.",
  },
  received: {
    title: "المنتجات المستلمة (وارد)",
    rows: receivedRows.value,
    columns: movementColumns,
    emptyMessage: "لا توجد عمليات استلام في هذا اليوم.",
  },
  stockOut: {
    title: "المنتجات المسحوبة",
    rows: stockOutRows.value,
    columns: movementColumns,
    emptyMessage: "لا توجد عمليات سحب مخزون في هذا اليوم.",
  },
  allMovements: {
    title: "كل حركات المخزن",
    rows: allMovementRows.value,
    columns: movementColumns,
    emptyMessage: "لا توجد حركات مخزن في هذا اليوم.",
  },
}));

const summaryCards = computed(() => {
  const s = report.value?.summary || {};
  return [
    {
      key: "sales",
      label: "المبيعات",
      value: s.sales ?? 0,
      clickable: true,
    },
    {
      key: "reservations",
      label: "الحجوزات الجديدة",
      value: s.reservations ?? 0,
      clickable: true,
    },
    {
      key: "delivered",
      label: "الحجوزات المسلّمة",
      value: s.deliveredReservations ?? 0,
      clickable: true,
    },
    {
      key: "payments",
      label: "إجمالي المدفوعات",
      value: formatMoney(s.paymentsTotal),
      clickable: false,
    },
    {
      key: "received",
      label: "المنتجات المستلمة",
      value: s.receivedQty ?? 0,
      clickable: true,
    },
    {
      key: "stockOut",
      label: "المنتجات المسحوبة",
      value: s.stockOutQty ?? 0,
      clickable: true,
    },
    {
      key: "returns",
      label: "المرتجعات",
      value: s.returns ?? 0,
      clickable: false,
    },
    {
      key: "exchanges",
      label: "الاستبدالات",
      value: s.exchanges ?? 0,
      clickable: false,
    },
    {
      key: "allMovements",
      label: "حركات المخزن",
      value: s.stockMovements ?? 0,
      clickable: true,
    },
  ];
});

const activeDetail = computed(() => {
  if (!activeDetailKey.value) return null;
  return detailSections.value[activeDetailKey.value] || null;
});

const openDetail = (key) => {
  if (!detailSections.value[key]) return;
  activeDetailKey.value = key;
  detailVisible.value = true;
};

const closeDetail = () => {
  detailVisible.value = false;
  activeDetailKey.value = null;
};

const loadReport = async () => {
  loading.value = true;
  try {
    report.value = await reportService.getDailyReport(dateRangeParams());
  } catch (error) {
    report.value = null;
    showError(error?.message || "تعذر تحميل تقرير اليوم.");
  } finally {
    loading.value = false;
  }
};

watch(selectedDate, () => {
  loadReport();
});

onMounted(loadReport);
</script>
