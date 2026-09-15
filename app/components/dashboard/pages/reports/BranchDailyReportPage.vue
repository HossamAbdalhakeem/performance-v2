<template>
  <div class="space-y-6 text-right" dir="rtl">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-white">تقرير اليوم</h2>
        <p class="mt-1 text-sm text-slate-400">
          نظرة سريعة على نشاط الفرع — اضغط أي بطاقة لعرض التفاصيل
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

    <template v-if="loading">
      <!-- Hero + activity skeleton -->
      <div class="grid gap-4 xl:grid-cols-3">
        <div
          class="rounded-2xl border border-white/10 bg-slate-900 p-5 xl:col-span-1"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="w-full space-y-3">
              <Skeleton width="8rem" height="0.9rem" border-radius="6px" />
              <Skeleton width="70%" height="2.25rem" border-radius="8px" />
            </div>
            <Skeleton width="2.75rem" height="2.75rem" border-radius="12px" />
          </div>
          <div class="mt-5 grid grid-cols-2 gap-3">
            <Skeleton width="100%" height="3.5rem" border-radius="12px" />
            <Skeleton width="100%" height="3.5rem" border-radius="12px" />
          </div>
        </div>

        <div
          class="rounded-2xl border border-white/10 bg-slate-900 p-5 xl:col-span-2"
        >
          <div class="mb-4 space-y-2">
            <Skeleton width="10rem" height="1.1rem" border-radius="6px" />
            <Skeleton width="16rem" height="0.75rem" border-radius="6px" />
          </div>
          <div class="grid gap-4 md:grid-cols-2 md:items-center">
            <div class="mx-auto flex h-52 w-full max-w-[240px] items-center justify-center">
              <Skeleton shape="circle" size="11rem" />
            </div>
            <div class="space-y-2.5">
              <Skeleton
                v-for="i in 4"
                :key="`legend-skel-${i}`"
                width="100%"
                height="2.75rem"
                border-radius="12px"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory chart skeleton -->
      <div class="rounded-2xl border border-white/10 bg-slate-900 p-5">
        <div class="mb-4 space-y-2">
          <Skeleton width="8rem" height="1.1rem" border-radius="6px" />
          <Skeleton width="18rem" height="0.75rem" border-radius="6px" />
        </div>
        <div class="flex h-56 items-end justify-around gap-4 px-4 pb-2">
          <Skeleton
            v-for="i in 4"
            :key="`bar-skel-${i}`"
            width="18%"
            :height="`${35 + i * 12}%`"
            border-radius="10px"
          />
        </div>
      </div>

      <!-- KPI cards skeleton -->
      <div>
        <Skeleton
          class="mb-3"
          width="7rem"
          height="1rem"
          border-radius="6px"
        />
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="i in 8"
            :key="`card-skel-${i}`"
            class="rounded-2xl border border-white/10 bg-slate-900 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="w-full space-y-3">
                <Skeleton width="55%" height="0.85rem" border-radius="6px" />
                <Skeleton width="40%" height="1.75rem" border-radius="8px" />
                <Skeleton width="70%" height="0.7rem" border-radius="6px" />
              </div>
              <Skeleton width="2.5rem" height="2.5rem" border-radius="12px" />
            </div>
            <Skeleton
              class="mt-3"
              width="5.5rem"
              height="0.7rem"
              border-radius="6px"
            />
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <!-- Hero payments + activity overview -->
      <div class="grid gap-4 xl:grid-cols-3">
        <div
          class="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 p-5 xl:col-span-1"
        >
          <div
            class="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/10 blur-2xl"
          />
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-sm text-emerald-200/80">إجمالي المدفوعات</p>
              <p class="mt-2 text-3xl font-extrabold tracking-tight text-white">
                {{ formatMoney(summary.paymentsTotal) }}
              </p>
            </div>
            <span
              class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300"
            >
              <i class="pi pi-wallet text-lg" />
            </span>
          </div>
          <div class="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-xl border border-white/5 bg-black/20 px-3 py-2">
              <p class="text-xs text-slate-400">مبيعات</p>
              <p class="mt-1 font-bold text-sky-300">{{ summary.sales ?? 0 }}</p>
            </div>
            <div class="rounded-xl border border-white/5 bg-black/20 px-3 py-2">
              <p class="text-xs text-slate-400">حجوزات</p>
              <p class="mt-1 font-bold text-amber-300">
                {{ summary.reservations ?? 0 }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl border border-white/10 bg-slate-900/90 p-5 xl:col-span-2"
        >
          <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p class="font-bold text-white">توزيع نشاط اليوم</p>
              <p class="mt-0.5 text-xs text-slate-400">
                مقارنة بين عمليات البيع والحجز والمخزن
              </p>
            </div>
          </div>
          <div class="grid gap-4 md:grid-cols-2 md:items-center">
            <div class="relative mx-auto h-52 w-full max-w-[240px]">
              <Doughnut
                v-if="hasActivityData"
                :data="activityChartData"
                :options="doughnutOptions"
              />
              <div
                v-else
                class="flex h-full items-center justify-center text-sm text-slate-500"
              >
                لا توجد بيانات لهذا اليوم
              </div>
              <div
                v-if="hasActivityData"
                class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
              >
                <span class="text-xs text-slate-400">الإجمالي</span>
                <span class="text-xl font-extrabold text-white">{{
                  activityTotal
                }}</span>
              </div>
            </div>
            <div class="space-y-2.5">
              <div
                v-for="item in activityLegend"
                :key="item.key"
                class="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2.5"
              >
                <div class="flex items-center gap-2">
                  <span
                    class="h-2.5 w-2.5 rounded-full"
                    :style="{ backgroundColor: item.color }"
                  />
                  <span class="text-sm text-slate-300">{{ item.label }}</span>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-sm font-bold text-white">{{
                    item.value
                  }}</span>
                  <span class="text-xs text-slate-500">{{ item.percent }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory movement bars -->
      <div class="rounded-2xl border border-white/10 bg-slate-900/90 p-5">
        <div class="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p class="font-bold text-white">حركة المخزن</p>
            <p class="mt-0.5 text-xs text-slate-400">
              كميات الوارد والسحب والمرتجعات والاستبدالات
            </p>
          </div>
        </div>
        <div class="h-56">
          <Bar
            v-if="hasInventoryData"
            :data="inventoryChartData"
            :options="barOptions"
          />
          <div
            v-else
            class="flex h-full items-center justify-center text-sm text-slate-500"
          >
            لا توجد حركات مخزن لهذا اليوم
          </div>
        </div>
      </div>

      <!-- Clickable KPI cards -->
      <div>
        <p class="mb-3 text-sm font-semibold text-slate-300">التفاصيل السريعة</p>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <button
            v-for="card in summaryCards"
            :key="card.key"
            type="button"
            class="group relative overflow-hidden rounded-2xl border p-4 text-right transition"
            :class="[
              card.borderClass,
              card.clickable
                ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20'
                : 'cursor-default opacity-95',
            ]"
            :disabled="!card.clickable"
            @click="card.clickable && openDetail(card.key)"
          >
            <div
              class="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
              :class="card.glowClass"
            />
            <div class="relative flex items-start justify-between gap-3">
              <div>
                <p class="text-sm text-slate-300">{{ card.label }}</p>
                <p class="mt-2 text-2xl font-extrabold text-white">
                  {{ card.value }}
                </p>
                <p v-if="card.hint" class="mt-1 text-xs text-slate-500">
                  {{ card.hint }}
                </p>
              </div>
              <span
                class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                :class="card.iconWrapClass"
              >
                <i :class="['pi text-base', card.icon]" />
              </span>
            </div>
            <div
              v-if="card.clickable"
              class="relative mt-3 flex items-center gap-1 text-xs text-slate-500 transition group-hover:text-slate-300"
            >
              <span>عرض التفاصيل</span>
              <i class="pi pi-angle-left text-[10px]" />
            </div>
          </button>
        </div>
      </div>
    </template>

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
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "vue-chartjs";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Skeleton from "primevue/skeleton";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import { reportService } from "~/services/reportService";
import { useAppToast } from "~/composables/useAppToast";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
);

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

const ACTIVITY_COLORS = {
  sales: "#38bdf8",
  reservations: "#fbbf24",
  delivered: "#34d399",
  movements: "#a78bfa",
};

const loading = ref(true);
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

const summary = computed(() => report.value?.summary || {});

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

const activityItems = computed(() => {
  const s = summary.value;
  return [
    {
      key: "sales",
      label: "المبيعات",
      value: Number(s.sales ?? 0),
      color: ACTIVITY_COLORS.sales,
    },
    {
      key: "reservations",
      label: "حجوزات جديدة",
      value: Number(s.reservations ?? 0),
      color: ACTIVITY_COLORS.reservations,
    },
    {
      key: "delivered",
      label: "حجوزات مسلّمة",
      value: Number(s.deliveredReservations ?? 0),
      color: ACTIVITY_COLORS.delivered,
    },
    {
      key: "movements",
      label: "حركات مخزن",
      value: Number(s.stockMovements ?? 0),
      color: ACTIVITY_COLORS.movements,
    },
  ];
});

const activityTotal = computed(() =>
  activityItems.value.reduce((sum, item) => sum + item.value, 0),
);

const hasActivityData = computed(() => activityTotal.value > 0);

const activityLegend = computed(() => {
  const total = activityTotal.value || 1;
  return activityItems.value.map((item) => ({
    ...item,
    percent: Math.round((item.value / total) * 100),
  }));
});

const activityChartData = computed(() => ({
  labels: activityItems.value.map((item) => item.label),
  datasets: [
    {
      data: activityItems.value.map((item) => item.value),
      backgroundColor: activityItems.value.map((item) => item.color),
      borderColor: "#0f172a",
      borderWidth: 3,
      hoverOffset: 6,
    },
  ],
}));

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "72%",
  plugins: {
    legend: { display: false },
    tooltip: {
      rtl: true,
      titleFont: { family: "Tahoma, Segoe UI, sans-serif" },
      bodyFont: { family: "Tahoma, Segoe UI, sans-serif" },
    },
  },
};

const inventorySeries = computed(() => {
  const s = summary.value;
  return [
    {
      label: "وارد",
      value: Number(s.receivedQty ?? 0),
      color: "#34d399",
    },
    {
      label: "سحب",
      value: Number(s.stockOutQty ?? 0),
      color: "#fb7185",
    },
    {
      label: "مرتجعات",
      value: Number(s.returns ?? 0),
      color: "#fbbf24",
    },
    {
      label: "استبدالات",
      value: Number(s.exchanges ?? 0),
      color: "#38bdf8",
    },
  ];
});

const hasInventoryData = computed(() =>
  inventorySeries.value.some((item) => item.value > 0),
);

const inventoryChartData = computed(() => ({
  labels: inventorySeries.value.map((item) => item.label),
  datasets: [
    {
      label: "الكمية",
      data: inventorySeries.value.map((item) => item.value),
      backgroundColor: inventorySeries.value.map((item) => item.color),
      borderRadius: 10,
      borderSkipped: false,
      maxBarThickness: 42,
    },
  ],
}));

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      rtl: true,
      titleFont: { family: "Tahoma, Segoe UI, sans-serif" },
      bodyFont: { family: "Tahoma, Segoe UI, sans-serif" },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#94a3b8",
        font: { size: 12, family: "Tahoma, Segoe UI, sans-serif" },
      },
      grid: { display: false },
      border: { color: "rgba(100, 116, 139, 0.4)" },
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: "#94a3b8",
        font: { size: 11, family: "Tahoma, Segoe UI, sans-serif" },
        precision: 0,
      },
      grid: {
        color: "rgba(148, 163, 184, 0.15)",
        drawBorder: false,
      },
      border: { display: false },
    },
  },
};

const summaryCards = computed(() => {
  const s = summary.value;
  return [
    {
      key: "sales",
      label: "المبيعات",
      value: s.sales ?? 0,
      hint: "عمليات بيع مباشر",
      icon: "pi-shopping-cart",
      clickable: true,
      borderClass: "border-sky-500/25 bg-slate-900",
      iconWrapClass: "bg-sky-500/15 text-sky-300",
      glowClass: "bg-gradient-to-bl from-sky-500/10 to-transparent",
    },
    {
      key: "reservations",
      label: "الحجوزات الجديدة",
      value: s.reservations ?? 0,
      hint: "حجوزات تم إنشاؤها اليوم",
      icon: "pi-bookmark",
      clickable: true,
      borderClass: "border-amber-500/25 bg-slate-900",
      iconWrapClass: "bg-amber-500/15 text-amber-300",
      glowClass: "bg-gradient-to-bl from-amber-500/10 to-transparent",
    },
    {
      key: "delivered",
      label: "الحجوزات المسلّمة",
      value: s.deliveredReservations ?? 0,
      hint: "تم التسليم اليوم",
      icon: "pi-check-circle",
      clickable: true,
      borderClass: "border-emerald-500/25 bg-slate-900",
      iconWrapClass: "bg-emerald-500/15 text-emerald-300",
      glowClass: "bg-gradient-to-bl from-emerald-500/10 to-transparent",
    },
    {
      key: "received",
      label: "المنتجات المستلمة",
      value: s.receivedQty ?? 0,
      hint: "كمية الوارد",
      icon: "pi-inbox",
      clickable: true,
      borderClass: "border-teal-500/25 bg-slate-900",
      iconWrapClass: "bg-teal-500/15 text-teal-300",
      glowClass: "bg-gradient-to-bl from-teal-500/10 to-transparent",
    },
    {
      key: "stockOut",
      label: "المنتجات المسحوبة",
      value: s.stockOutQty ?? 0,
      hint: "كمية السحب",
      icon: "pi-box",
      clickable: true,
      borderClass: "border-rose-500/25 bg-slate-900",
      iconWrapClass: "bg-rose-500/15 text-rose-300",
      glowClass: "bg-gradient-to-bl from-rose-500/10 to-transparent",
    },
    {
      key: "allMovements",
      label: "حركات المخزن",
      value: s.stockMovements ?? 0,
      hint: "كل الحركات المسجّلة",
      icon: "pi-arrows-h",
      clickable: true,
      borderClass: "border-violet-500/25 bg-slate-900",
      iconWrapClass: "bg-violet-500/15 text-violet-300",
      glowClass: "bg-gradient-to-bl from-violet-500/10 to-transparent",
    },
    {
      key: "returns",
      label: "المرتجعات",
      value: s.returns ?? 0,
      hint: "عمليات مرتجع",
      icon: "pi-replay",
      clickable: false,
      borderClass: "border-white/10 bg-slate-900",
      iconWrapClass: "bg-slate-700/50 text-slate-300",
      glowClass: "",
    },
    {
      key: "exchanges",
      label: "الاستبدالات",
      value: s.exchanges ?? 0,
      hint: "عمليات استبدال",
      icon: "pi-sync",
      clickable: false,
      borderClass: "border-white/10 bg-slate-900",
      iconWrapClass: "bg-slate-700/50 text-slate-300",
      glowClass: "",
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
