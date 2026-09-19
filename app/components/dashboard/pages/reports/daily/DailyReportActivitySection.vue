<template>
  <div class="rounded-2xl border border-white/10 bg-slate-900/90 p-5">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <p class="font-bold text-white">{{ title }}</p>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col gap-5">
      <div
        class="mx-auto flex h-52 w-full max-w-[240px] items-center justify-center"
      >
        <Skeleton shape="circle" size="11rem" />
      </div>
      <div class="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton
          v-for="i in skeletonTiles"
          :key="`activity-skel-${i}`"
          width="100%"
          height="2.75rem"
          border-radius="12px"
        />
      </div>
    </div>

    <div v-else class="flex flex-col gap-5">
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
              class="flex w-full items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2.5 text-right transition"
              :disabled="!isClickable(item)"
              :class="
                isClickable(item)
                  ? 'cursor-pointer hover:border-white/20 hover:bg-slate-950/70'
                  : 'cursor-default opacity-80'
              "
              @click="isClickable(item) && $emit('open-detail', item.sectionKey)"
            >
              <div class="flex min-w-0 items-center gap-2">
                <span
                  class="h-2.5 w-2.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: item.color }"
                />
                <span class="truncate text-sm text-slate-300">{{
                  item.label
                }}</span>
              </div>
              <div class="flex shrink-0 items-baseline gap-2">
                <span class="text-sm font-bold text-white">{{
                  item.value
                }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "vue-chartjs";
import {
  REPORT_ACTIVITY_KEY_LABELS,
  getReportMetricColor,
} from "~/utils/domainLabels";

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
  refunds: "refunds",
  reservations: "reservations",
  ready: null,
  waiting: null,
  branches: null,
};

const props = defineProps({
  title: { type: String, default: "توزيع نشاط اليوم" },
  loading: { type: Boolean, default: false },
  skeletonTiles: { type: Number, default: 9 },
  /** Metric definitions built by the parent page */
  metrics: {
    type: Array,
    default: () => [],
  },
  activity: {
    type: Object,
    default: () => ({ items: [], total: 0 }),
  },
});

defineEmits(["open-detail"]);

const isClickable = (item) =>
  Boolean(item?.sectionKey) && Number(item?.value || 0) > 0;

const activityByKey = computed(() => {
  const map = {};
  for (const item of Array.isArray(props.activity?.items)
    ? props.activity.items
    : []) {
    map[item.key] = item;
  }
  return map;
});

const legend = computed(() => {
  const defs = Array.isArray(props.metrics) ? props.metrics : [];
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
      sectionKey:
        def.sectionKey !== undefined
          ? def.sectionKey
          : (SECTION_MAP[def.key] ?? null),
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

const hasData = computed(
  () => total.value > 0 || legend.value.some((item) => item.value > 0),
);

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
