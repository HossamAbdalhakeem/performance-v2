<template>
  <div class="rounded-2xl border border-white/10 bg-slate-900/90 p-5">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <p class="font-bold text-white">توزيع نشاط اليوم</p>
        <p class="mt-0.5 text-xs text-slate-400">{{ subtitle }}</p>
      </div>
    </div>
    <div class="grid gap-4 md:grid-cols-2 md:items-center">
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
      <div class="space-y-2.5">
        <div
          v-for="item in legend"
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
            <span class="text-sm font-bold text-white">{{ item.value }}</span>
            <span class="text-xs text-slate-500">{{ item.percent }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "vue-chartjs";

ChartJS.register(ArcElement, Tooltip, Legend);

defineOptions({ name: "DailyReportActivitySection" });

const props = defineProps({
  isCustomerService: { type: Boolean, default: false },
  activity: {
    type: Object,
    default: () => ({ items: [], total: 0 }),
  },
});

const subtitle = computed(() =>
  props.isCustomerService
    ? "توزيع حالات حجوزاتك عبر كل الفروع"
    : "مقارنة بين عمليات البيع والحجز والمخزن",
);

const legend = computed(() =>
  Array.isArray(props.activity?.items) ? props.activity.items : [],
);

const total = computed(() => Number(props.activity?.total ?? 0));

const hasData = computed(() => total.value > 0);

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
