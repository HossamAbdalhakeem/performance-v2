<template>
  <div class="space-y-8 text-right" dir="rtl">
    <div>
      <h2 class="text-xl font-bold text-white">الرئيسية</h2>
      <p class="mt-1 text-sm text-slate-400">
        نظرة عامة على النظام مع اختصارات سريعة للصفحات والعمليات
      </p>
    </div>

    <AdminHomeKpiSection
      :cards="kpiCards"
      :loading="summaryLoading"
      @select="onKpiSelect"
    />

    <AdminHomeActionsSection :actions="actionCards" @select="onActionSelect" />

    <AdminHomeInsightsSection
      :payment-method-items="paymentMethodItems"
      :payments-loading="paymentsLoading"
      :sales-trend-points="salesTrendPoints"
      :sales-trend-branch-id="salesTrendBranchId"
      :sales-trend-loading="salesTrendLoading"
      :top-products="topProducts"
      :products-loading="productsLoading"
      @update:sales-trend-branch-id="onSalesTrendBranchChange"
    />

    <AdminHomeRecentOperationsSection
      :rows="recentOperationRows"
      :loading="recentLoading"
    />
  </div>
</template>

<script setup>
import { reportService } from "~/services/reportService";
import {
  TRANSACTION_TYPE_LABELS,
  RESERVATION_STATUS_LABELS,
} from "~/utils/domainLabels";
import { formatMoney } from "~/utils/format";

defineOptions({ name: "AdminHomePage" });

const AdminHomeKpiSection = defineAsyncComponent(() =>
  import("./AdminHomeKpiSection.vue"),
);
const AdminHomeActionsSection = defineAsyncComponent(() =>
  import("./AdminHomeActionsSection.vue"),
);
const AdminHomeInsightsSection = defineAsyncComponent(() =>
  import("./AdminHomeInsightsSection.vue"),
);
const AdminHomeRecentOperationsSection = defineAsyncComponent(() =>
  import("./AdminHomeRecentOperationsSection.vue"),
);

const router = useRouter();

const summaryLoading = ref(true);
const paymentsLoading = ref(true);
const productsLoading = ref(true);
const recentLoading = ref(true);
const salesTrendLoading = ref(true);

const summary = ref({
  branchesCount: 0,
  studentsCount: 0,
  productsCount: 0,
  teachersCount: 0,
});
const paymentMethodItems = ref([]);
const topProducts = ref([]);
const recentOperations = ref([]);
const salesTrendPoints = ref([]);
const salesTrendBranchId = ref(null);

const OPERATION_TYPE_LABELS = {
  SALE: TRANSACTION_TYPE_LABELS.SALE,
  RESERVATION: TRANSACTION_TYPE_LABELS.RESERVATION,
  DELIVERED: RESERVATION_STATUS_LABELS.DELIVERED,
  CANCELLED: RESERVATION_STATUS_LABELS.CANCELLED,
  RETURN: TRANSACTION_TYPE_LABELS.RETURN,
  EXCHANGE: TRANSACTION_TYPE_LABELS.EXCHANGE,
};

const kpiCards = computed(() => {
  const s = summary.value || {};
  return [
    {
      type: "branches",
      title: "الفروع",
      count: s.branchesCount ?? 0,
      hint: "إجمالي الفروع",
      to: "/branches",
    },
    {
      type: "students",
      title: "الطلاب",
      count: s.studentsCount ?? 0,
      hint: "إجمالي الطلاب",
      to: "/students",
    },
    {
      type: "products",
      title: "المنتجات",
      count: s.productsCount ?? 0,
      hint: "إجمالي المنتجات",
      to: "/products",
    },
    {
      type: "teachers",
      title: "المدرسين",
      count: s.teachersCount ?? 0,
      hint: "إجمالي المدرسين",
      to: "/teachers",
    },
  ];
});

const actionCards = [
  {
    key: "reports",
    title: "التقارير",
    description: "عرض وتحميل جميع التقارير",
    actionLabel: "عرض التقارير",
    icon: "pi-chart-bar",
    to: "/reports",
    iconWrapClass: "bg-sky-500/15 text-sky-300",
    buttonClass: "bg-sky-600 hover:bg-sky-500",
    accentLineClass:
      "bg-gradient-to-l from-transparent via-sky-400/60 to-transparent",
  },
  {
    key: "reservations",
    title: "إدارة الحجوزات",
    description: "متابعة الحجوزات والإلغاء والاستلام",
    actionLabel: "إدارة الحجوزات",
    icon: "pi-bookmark",
    to: "/reservations/manage",
    iconWrapClass: "bg-amber-500/15 text-amber-300",
    buttonClass: "bg-amber-600 hover:bg-amber-500",
    accentLineClass:
      "bg-gradient-to-l from-transparent via-amber-400/60 to-transparent",
  },
  {
    key: "inventory",
    title: "إدارة المخزن",
    description: "إضافة وسحب الكميات من الفروع",
    actionLabel: "إدارة المخزن",
    icon: "pi-box",
    to: "/branches",
    iconWrapClass: "bg-emerald-500/15 text-emerald-300",
    buttonClass: "bg-emerald-600 hover:bg-emerald-500",
    accentLineClass:
      "bg-gradient-to-l from-transparent via-emerald-400/60 to-transparent",
  },
  {
    key: "teachers",
    title: "المدرسين",
    description: "إضافة وإدارة المدرسين",
    actionLabel: "إدارة المدرسين",
    icon: "pi-user",
    to: "/teachers",
    iconWrapClass: "bg-blue-500/15 text-blue-300",
    buttonClass: "bg-blue-600 hover:bg-blue-500",
    accentLineClass:
      "bg-gradient-to-l from-transparent via-blue-400/60 to-transparent",
  },
  {
    key: "exchange-refund",
    title: "استبدال واسترداد",
    description: "استبدال المنتجات واسترداد المبالغ",
    actionLabel: "استبدال واسترداد",
    icon: "pi-sync",
    to: "/sales/exchange",
    iconWrapClass: "bg-violet-500/15 text-violet-300",
    buttonClass: "bg-violet-600 hover:bg-violet-500",
    accentLineClass:
      "bg-gradient-to-l from-transparent via-violet-400/60 to-transparent",
  },
];

const formatTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
};

const recentOperationRows = computed(() =>
  (recentOperations.value || []).map((row, index) => {
    const type = String(row.type || "").toUpperCase();
    return {
      id: index + 1,
      time: formatTime(row.time),
      typeKey: type,
      typeLabel: OPERATION_TYPE_LABELS[type] || type || "—",
      student: row.student || "—",
      product: row.product || "—",
      amount: row.amount == null ? "—" : formatMoney(row.amount, "locale"),
      amountLabel:
        row.amount == null ? "—" : formatMoney(row.amount, "locale"),
      branch: row.branch || "—",
    };
  }),
);

const onKpiSelect = (card) => {
  if (card?.to) router.push(card.to);
};

const onActionSelect = (action) => {
  if (action?.to) router.push(action.to);
};

const loadSummary = async () => {
  summaryLoading.value = true;
  try {
    summary.value = (await reportService.getGeneralSummary()) || {
      branchesCount: 0,
      studentsCount: 0,
      productsCount: 0,
      teachersCount: 0,
    };
  } catch {
    summary.value = {
      branchesCount: 0,
      studentsCount: 0,
      productsCount: 0,
      teachersCount: 0,
    };
  } finally {
    summaryLoading.value = false;
  }
};

const loadPayments = async () => {
  paymentsLoading.value = true;
  try {
    const data = await reportService.getGeneralPayments();
    paymentMethodItems.value = Array.isArray(data) ? data : [];
  } catch {
    paymentMethodItems.value = [];
  } finally {
    paymentsLoading.value = false;
  }
};

const loadTopProducts = async () => {
  productsLoading.value = true;
  try {
    const data = await reportService.getGeneralTopProducts();
    topProducts.value = Array.isArray(data) ? data : [];
  } catch {
    topProducts.value = [];
  } finally {
    productsLoading.value = false;
  }
};

const loadRecentOperations = async () => {
  recentLoading.value = true;
  try {
    const data = await reportService.getGeneralRecentOperations();
    recentOperations.value = Array.isArray(data) ? data : [];
  } catch {
    recentOperations.value = [];
  } finally {
    recentLoading.value = false;
  }
};

const loadSalesTrend = async () => {
  salesTrendLoading.value = true;
  try {
    const data = await reportService.getGeneralSalesTrend({
      branchId: salesTrendBranchId.value || undefined,
    });
    salesTrendPoints.value = Array.isArray(data?.points) ? data.points : [];
  } catch {
    salesTrendPoints.value = [];
  } finally {
    salesTrendLoading.value = false;
  }
};

const onSalesTrendBranchChange = (branchId) => {
  salesTrendBranchId.value = branchId;
  loadSalesTrend();
};

onMounted(() => {
  loadSummary();
  loadPayments();
  loadTopProducts();
  loadRecentOperations();
  loadSalesTrend();
});
</script>
