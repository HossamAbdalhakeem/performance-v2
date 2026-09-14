<template>
  <div class="h-52 w-full">
    <Line :data="chartData" :options="chartOptions" />
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

defineOptions({ name: "CustomersByYearChart" });

const props = defineProps({
  labels: {
    type: Array,
    default: () => ["أولى", "تانية", "تالتة", "رابعة", "خامسة"],
  },
  values: {
    type: Array,
    default: () => [18, 62, 48, 95, 72],
  },
  lineColor: {
    type: String,
    default: "#4472C4",
  },
});

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: "عدد العملاء",
      data: props.values,
      borderColor: props.lineColor,
      backgroundColor: props.lineColor,
      pointBackgroundColor: props.lineColor,
      pointBorderColor: props.lineColor,
      pointRadius: 4,
      pointHoverRadius: 5,
      borderWidth: 3,
      tension: 0.15,
      fill: false,
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
      grid: { display: false },
      border: { color: "#64748b" },
    },
    y: {
      beginAtZero: true,
      ticks: {
        display: true,
        color: "#94a3b8",
        font: { size: 11, family: "Tahoma, Segoe UI, sans-serif" },
        callback(value) {
          return Number(value).toLocaleString("en-US");
        },
      },
      grid: {
        display: true,
        color: "rgba(148, 163, 184, 0.25)",
        drawBorder: false,
      },
      border: { color: "#64748b" },
    },
  },
};
</script>
