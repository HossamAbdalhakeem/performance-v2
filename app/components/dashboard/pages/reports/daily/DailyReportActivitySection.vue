<template>
  <div class="rounded-2xl border border-white/10 bg-slate-900/90 p-5">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <p class="font-bold text-white">توزيع نشاط اليوم</p>
    
      </div>
    </div>
    <div class="flex flex-col gap-5">
      <div class="relative mx-auto h-52 w-full max-w-[240px]">
        <Doughnut
          v-if="hasData"
          :data="chartData"
          :options="doughnutOptions"
        />
        <div
          v-else
          class="flex h-full items-center justify-center text-sm text-slate-500"
        >
          لا توجد بيانات لهذا اليوم
        </div>
        <div
          v-if="hasData"
          class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          <span class="text-xs text-slate-400">الإجمالي</span>
          <span class="text-xl font-extrabold text-white">{{ total }}</span>
        </div>
      </div>
      <div class="space-y-4">
        <div
          v-for="group in legendGroups"
          :key="group.key"
          class="space-y-2"
        >
          <p class="text-xs font-semibold tracking-wide text-slate-400">
            {{ group.label }}
          </p>
          <div
            class="grid gap-2.5"
            :class="
              group.items.length === 1
                ? 'sm:grid-cols-1'
                : group.items.length === 2
                  ? 'sm:grid-cols-2'
                  : 'sm:grid-cols-2 xl:grid-cols-3'
            "
          >
            <button
              v-for="item in group.items"
              :key="item.key"
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2.5 text-right transition hover:border-white/20 hover:bg-slate-950/70"
              :disabled="!item.sectionKey"
              :class="item.sectionKey ? 'cursor-pointer' : 'cursor-default opacity-80'"
              @click="item.sectionKey && $emit('open-detail', item.sectionKey)"
            >
              <div class="flex min-w-0 items-center gap-2">
                <span
                  class="h-2.5 w-2.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: item.color }"
                />
                <span class="truncate text-sm text-slate-300">{{ item.label }}</span>
              </div>
              <div class="flex shrink-0 items-baseline gap-2">
                <span class="text-sm font-bold text-white">{{ item.value }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "vue-chartjs";
import { REPORT_ACTIVITY_KEY_LABELS, getReportMetricColor } from "~/utils/domainLabels";

ChartJS.register(ArcElement, Tooltip, Legend);

defineOptions({ name: "DailyReportActivitySection" });

const SECTION_MAP = {
  sales: "sales",
  delivered: "delivered",
  undelivered: "undelivered",
  cancelled: "cancelled",
  received: "received",
  stockOut: "stockOut",
  allMovements: "allMovements",
  returns: "returns",
  exchanges: "exchanges",
  reservations: "reservations",
  ready: null,
  waiting: null,
  branches: null,
};

const props = defineProps({
  isCustomerService: { type: Boolean, default: false },
  activity: {
    type: Object,
    default: () => ({ items: [], total: 0 }),
  },
  summary: { type: Object, default: () => ({}) },
});

defineEmits(["open-detail"]);



const metricDefs = computed(() => {
  const s = props.summary || {};
  const undelivered = Number(
    s.undeliveredReservations ??
      Math.max(
        0,
        Number(s.reservations ?? 0) -
          Number(s.deliveredReservations ?? 0) -
          Number(s.cancelledReservations ?? 0),
      ),
  );

  if (props.isCustomerService) {
    return [
      {
        group: "reservations",
        groupLabel: "الحجوزات",
        key: "reservations",
        label: "الحجوزات الجديدة",
        value: Number(s.reservations ?? 0),
      },
      {
        group: "reservations",
        groupLabel: "الحجوزات",
        key: "ready",
        label: "جاهزة للتسليم",
        value: Number(s.readyReservations ?? 0),
      },
      {
        group: "reservations",
        groupLabel: "الحجوزات",
        key: "waiting",
        label: "بانتظار المخزون",
        value: Number(s.waitingReservations ?? 0),
      },
      {
        group: "branches",
        groupLabel: "الفروع",
        key: "branches",
        label: "الفروع",
        value: Number(s.branchesCount ?? 0),
      },
    ];
  }

  return [
    {
      group: "sales",
      groupLabel: "المبيعات",
      key: "sales",
      label: "المبيعات",
      value: Number(s.sales ?? 0),
    },
    {
      group: "reservations",
      groupLabel: "الحجوزات",
      key: "delivered",
      label: "حجوزات مسلّمة",
      value: Number(s.deliveredReservations ?? 0),
    },
    {
      group: "reservations",
      groupLabel: "الحجوزات",
      key: "undelivered",
      label: "حجوزات لم تستلم",
      value: undelivered,
    },
    {
      group: "reservations",
      groupLabel: "الحجوزات",
      key: "cancelled",
      label: "حجوزات ملغاة",
      value: Number(s.cancelledReservations ?? 0),
    },
    {
      group: "inventory",
      groupLabel: "المخزن",
      key: "received",
      label: "المنتجات المستلمة",
      value: Number(s.receivedQty ?? 0),
    },
    {
      group: "inventory",
      groupLabel: "المخزن",
      key: "stockOut",
      label: "المنتجات المسحوبة",
      value: Number(s.stockOutQty ?? 0),
    },
    {
      group: "inventory",
      groupLabel: "المخزن",
      key: "allMovements",
      label: "حركات المخزن",
      value: Number(s.stockMovements ?? 0),
    },
    {
      group: "returns",
      groupLabel: "المرتجعات والاستبدال",
      key: "returns",
      label: "المرتجعات",
      value: Number(s.returns ?? 0),
    },
    {
      group: "returns",
      groupLabel: "المرتجعات والاستبدال",
      key: "exchanges",
      label: "الاستبدالات",
      value: Number(s.exchanges ?? 0),
    },
  ];
});

const activityByKey = computed(() => {
  const map = {};
  for (const item of Array.isArray(props.activity?.items) ? props.activity.items : []) {
    map[item.key] = item;
  }
  return map;
});

const legend = computed(() => {
  const defs = metricDefs.value;
  const sum = defs.reduce((acc, item) => acc + Number(item.value || 0), 0);

  return defs.map((def) => {
    const fromActivity = activityByKey.value[def.key];
    const value = Number(
      fromActivity?.value != null ? fromActivity.value : def.value || 0,
    );
    const percent =
      fromActivity?.percent != null
        ? Number(fromActivity.percent)
        : sum > 0
          ? Math.round((value / sum) * 100)
          : 0;

    return {
      key: def.key,
      group: def.group,
      groupLabel: def.groupLabel,
      label: REPORT_ACTIVITY_KEY_LABELS[def.key] || def.label,
      value,
      percent,
      color: getReportMetricColor(def.key),
      sectionKey: SECTION_MAP[def.key] ?? null,
    };
  });
});

const legendGroups = computed(() => {
  const groups = [];
  const indexByKey = new Map();

  for (const item of legend.value) {
    if (!indexByKey.has(item.group)) {
      indexByKey.set(item.group, groups.length);
      groups.push({
        key: item.group,
        label: item.groupLabel,
        items: [],
      });
    }
    groups[indexByKey.get(item.group)].items.push(item);
  }

  return groups;
});

const total = computed(() => {
  const activityTotal = Number(props.activity?.total ?? 0);
  if (activityTotal > 0) return activityTotal;
  return legend.value.reduce((acc, item) => acc + Number(item.value || 0), 0);
});

const hasData = computed(() => total.value > 0 || legend.value.some((item) => item.value > 0));

const chartData = computed(() => ({
  labels: legend.value.map((item) => item.label),
  datasets: [
    {
      data: legend.value.map((item) => item.value),
      backgroundColor: legend.value.map((item) => item.color),
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
</script>
