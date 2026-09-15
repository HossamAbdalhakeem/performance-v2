<template>
  <div class="space-y-6 text-right" dir="rtl">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-white">تقرير اليوم</h2>
        <p class="mt-1 text-sm text-slate-400">
          كل ما حدث في الفرع خلال اليوم
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

    <p
      v-if="errorMessage"
      class="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300"
    >
      {{ errorMessage }}
    </p>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-xl border border-white/10 bg-slate-900 p-4"
      >
        <p class="text-sm text-slate-300">{{ card.label }}</p>
        <p class="mt-2 text-2xl font-bold text-white">{{ card.value }}</p>
      </div>
    </div>

    <section class="rounded-xl border border-white/10 bg-slate-900 p-4">
      <h3 class="mb-3 font-bold text-white">المنتجات المستلمة (وارد)</h3>
      <AppDataTable
        :value="receivedRows"
        :columns="movementColumns"
        empty-message="لا توجد عمليات استلام اليوم."
      />
    </section>

    <section class="rounded-xl border border-white/10 bg-slate-900 p-4">
      <h3 class="mb-3 font-bold text-white">المنتجات المسحوبة / الخارجة</h3>
      <AppDataTable
        :value="takenRows"
        :columns="movementColumns"
        empty-message="لا توجد عمليات سحب اليوم."
      />
    </section>

    <section class="rounded-xl border border-white/10 bg-slate-900 p-4">
      <h3 class="mb-3 font-bold text-white">المبيعات</h3>
      <AppDataTable
        :value="saleRows"
        :columns="saleColumns"
        empty-message="لا توجد مبيعات اليوم."
      />
    </section>

    <section class="rounded-xl border border-white/10 bg-slate-900 p-4">
      <h3 class="mb-3 font-bold text-white">الحجوزات الجديدة</h3>
      <AppDataTable
        :value="reservationRows"
        :columns="reservationColumns"
        empty-message="لا توجد حجوزات جديدة اليوم."
      />
    </section>

    <section class="rounded-xl border border-white/10 bg-slate-900 p-4">
      <h3 class="mb-3 font-bold text-white">الحجوزات المسلّمة</h3>
      <AppDataTable
        :value="deliveredRows"
        :columns="deliveredColumns"
        empty-message="لا توجد حجوزات مسلّمة اليوم."
      />
    </section>

    <section class="rounded-xl border border-white/10 bg-slate-900 p-4">
      <h3 class="mb-3 font-bold text-white">كل حركات المخزن</h3>
      <AppDataTable
        :value="allMovementRows"
        :columns="movementColumns"
        empty-message="لا توجد حركات مخزن اليوم."
      />
    </section>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import { reportService } from "~/services/reportService";

defineOptions({ name: "BranchDailyReportPage" });

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
const errorMessage = ref("");
const report = ref(null);

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

const summaryCards = computed(() => {
  const s = report.value?.summary || {};
  return [
    { label: "المبيعات", value: s.sales ?? 0 },
    { label: "الحجوزات الجديدة", value: s.reservations ?? 0 },
    { label: "الحجوزات المسلّمة", value: s.deliveredReservations ?? 0 },
    { label: "إجمالي المدفوعات", value: formatMoney(s.paymentsTotal) },
    { label: "كمية مستلمة", value: s.receivedQty ?? 0 },
    { label: "كمية مسحوبة/خارجة", value: s.takenQty ?? 0 },
    { label: "مرتجعات", value: s.returns ?? 0 },
    { label: "استبدالات", value: s.exchanges ?? 0 },
  ];
});

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
const takenRows = computed(() =>
  (report.value?.takenProducts || []).map(mapMovement),
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

const loadReport = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    report.value = await reportService.getDailyReport(dateRangeParams());
  } catch (error) {
    report.value = null;
    errorMessage.value = error?.message || "تعذر تحميل تقرير اليوم.";
  } finally {
    loading.value = false;
  }
};

watch(selectedDate, () => {
  loadReport();
});

onMounted(loadReport);
</script>
