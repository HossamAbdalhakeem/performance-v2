<template>
  <div class="space-y-6 text-right" dir="rtl">
    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div class="min-w-0">
        <h2 class="text-xl font-bold text-white">{{ title }}</h2>
        <p class="mt-1 text-sm text-slate-400">{{ subtitle }}</p>
      </div>

      <slot name="filters" />
    </div>

    <DailyReportSkeleton v-if="loading" />

    <template v-else>
      <div class="grid gap-4 xl:grid-cols-3 xl:items-start">
        <div class="flex flex-col gap-4 xl:col-span-1">
          <DailyReportHero
            :title="heroTitle"
            :payments-total="paymentsTotal"
            :refunds-total="refundsTotal"
            :chips="heroChips"
          />
          <PaymentMethodsReport
            :items="paymentMethodItems"
            :total-label="paymentTotalLabel"
          />
        </div>
        <DailyReportActivitySection
          class="xl:col-span-2"
          :title="activityTitle"
          :loading="sectionsLoading"
          :skeleton-tiles="activitySkeletonTiles"
          :metrics="activityMetrics"
          :activity="activity"
          @open-detail="$emit('open-detail', $event)"
        />
      </div>
    </template>

    <DailyReportDetailDialog
      v-if="detailVisible"
      v-model:visible="detailVisibleProxy"
      :loading="detailLoading"
      :section-key="activeDetailKey"
      :rows="activeDetailRows"
      :is-customer-service="isCustomerService"
      @close="$emit('close-detail')"
    />
  </div>
</template>

<script setup>
defineOptions({ name: "DailyReportShell" });

const DailyReportSkeleton = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportSkeleton.vue"),
);
const DailyReportHero = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportHero.vue"),
);
const DailyReportActivitySection = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportActivitySection.vue"),
);
const PaymentMethodsReport = defineAsyncComponent(() =>
  import("~/components/shared/payment-methods-report/index.vue"),
);
const DailyReportDetailDialog = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportDetailDialog.vue"),
);

const props = defineProps({
  title: { type: String, default: "تقرير اليوم" },
  subtitle: { type: String, default: "" },
  heroTitle: { type: String, default: "صافي المدفوعات" },
  activityTitle: { type: String, default: "توزيع نشاط اليوم" },
  paymentTotalLabel: { type: String, default: "إجمالي المحصل" },
  loading: { type: Boolean, default: false },
  sectionsLoading: { type: Boolean, default: false },
  activitySkeletonTiles: { type: Number, default: 9 },
  paymentsTotal: { type: [Number, String], default: 0 },
  refundsTotal: { type: [Number, String], default: 0 },
  heroChips: { type: Array, default: () => [] },
  paymentMethodItems: { type: Array, default: () => [] },
  activityMetrics: { type: Array, default: () => [] },
  activity: { type: Object, default: () => ({ items: [], total: 0 }) },
  detailVisible: { type: Boolean, default: false },
  detailLoading: { type: Boolean, default: false },
  activeDetailKey: { type: String, default: null },
  activeDetailRows: { type: Array, default: () => [] },
  isCustomerService: { type: Boolean, default: false },
});

const emit = defineEmits([
  "open-detail",
  "close-detail",
  "update:detailVisible",
]);

const detailVisibleProxy = computed({
  get: () => props.detailVisible,
  set: (value) => emit("update:detailVisible", value),
});
</script>
