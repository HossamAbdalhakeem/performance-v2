<template>
  <div
    class="rounded-2xl border border-white/10 bg-slate-900/90 p-5"
    dir="rtl"
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p class="font-bold text-white">{{ title }}</p>
      <AppGlobalSelectBranch
        :model-value="branchId || 'all'"
        label=""
        placeholder="جميع الفروع"
        include-all-option
        all-option-label="جميع الفروع"
        all-option-value="all"
        wrapper-class="min-w-[10rem]"
        select-class="w-full text-sm"
        @update:model-value="onBranchChange"
      />
    </div>

    <div
      v-if="loading"
      class="space-y-4"
    >
      <div class="flex items-end justify-between gap-2">
        <Skeleton width="2.5rem" height="0.7rem" border-radius="4px" />
        <Skeleton width="2.5rem" height="0.7rem" border-radius="4px" />
      </div>
      <Skeleton width="100%" height="12rem" border-radius="12px" />
    </div>

    <div v-else class="h-56 w-full">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "vue-chartjs";
import AppGlobalSelectBranch from "~/components/shared/app-global-select-branch/index.vue";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

defineOptions({ name: "AdminHomeSalesTrendCard" });

const props = defineProps({
  title: { type: String, default: "المبيعات خلال آخر 7 أيام" },
  points: { type: Array, default: () => [] },
  branchId: { type: String, default: null },
  loading: { type: Boolean, default: false },
  lineColor: { type: String, default: "#38bdf8" },
});

const emit = defineEmits(["update:branchId"]);

const onBranchChange = (value) => {
  emit("update:branchId", value === "all" || !value ? null : String(value));
};

const labels = computed(() =>
  (props.points || []).map((point) => point.label || point.date || ""),
);

const values = computed(() =>
  (props.points || []).map((point) => Number(point.amount || 0)),
);

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [
    {
      label: "المبيعات",
      data: values.value,
      borderColor: props.lineColor,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return "rgba(56, 189, 248, 0.15)";
        const gradient = ctx.createLinearGradient(
          0,
          chartArea.top,
          0,
          chartArea.bottom,
        );
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.35)");
        gradient.addColorStop(1, "rgba(56, 189, 248, 0.02)");
        return gradient;
      },
      pointBackgroundColor: props.lineColor,
      pointBorderColor: "#0f172a",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2.5,
      tension: 0.35,
      fill: true,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      rtl: true,
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      titleFont: { family: "Tahoma, Segoe UI, sans-serif" },
      bodyFont: { family: "Tahoma, Segoe UI, sans-serif" },
      callbacks: {
        label(context) {
          const value = Number(context.parsed.y || 0);
          return value.toLocaleString("en-US");
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#94a3b8",
        font: { size: 11, family: "Tahoma, Segoe UI, sans-serif" },
      },
      grid: {
        color: "rgba(148, 163, 184, 0.12)",
      },
      border: { color: "rgba(100, 116, 139, 0.4)" },
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: "#94a3b8",
        font: { size: 11, family: "Tahoma, Segoe UI, sans-serif" },
        callback(value) {
          return Number(value).toLocaleString("en-US");
        },
      },
      grid: {
        color: "rgba(148, 163, 184, 0.18)",
        drawBorder: false,
      },
      border: { color: "rgba(100, 116, 139, 0.4)" },
    },
  },
};
</script>
