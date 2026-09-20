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
        </div>
        <PaymentMethodsReport
          class="xl:col-span-2"
          :items="paymentMethodItems"
          :total-label="paymentTotalLabel"
        />
      </div>

      <div v-if="showOperations" class="mt-2 space-y-4">
        <DailyReportOperationsSection
          title="عمليات الطلاب"
          subtitle="بيع وحجز واستبدال واسترداد"
          empty-message="لا توجد عمليات طلاب خلال الفترة المحددة."
          :type-labels="studentTypeLabels"
          :rows="studentRows"
          :loading="studentLoading"
          :error="studentError"
          :page="studentPage"
          :page-size="studentPageSize"
          :total-records="studentTotal"
          :movement-type="studentType"
          :show-student="true"
          @retry="$emit('retry-student')"
          @update:page="$emit('update:studentPage', $event)"
          @update:movement-type="$emit('update:studentType', $event)"
        />

        <DailyReportOperationsSection
          title="عمليات المخزن"
          subtitle="إضافة وسحب وتسوية المخزون"
          empty-message="لا توجد عمليات مخزن خلال الفترة المحددة."
          :type-labels="stockTypeLabels"
          :rows="stockRows"
          :loading="stockLoading"
          :error="stockError"
          :page="stockPage"
          :page-size="stockPageSize"
          :total-records="stockTotal"
          :movement-type="stockType"
          :show-student="false"
          @retry="$emit('retry-stock')"
          @update:page="$emit('update:stockPage', $event)"
          @update:movement-type="$emit('update:stockType', $event)"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import {
  STOCK_OPERATION_LABELS,
  STUDENT_OPERATION_LABELS,
} from "~/utils/domainLabels";

defineOptions({ name: "DailyReportShell" });

const DailyReportSkeleton = defineAsyncComponent(() =>
  import("./partials/DailyReportSkeleton.vue"),
);
const DailyReportHero = defineAsyncComponent(() =>
  import("./partials/DailyReportHero.vue"),
);
const PaymentMethodsReport = defineAsyncComponent(() =>
  import("~/components/shared/payment-methods-report/index.vue"),
);
const DailyReportOperationsSection = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/daily/DailyReportOperationsSection/index.vue"
  ),
);

defineProps({
  title: { type: String, default: "تقرير اليوم" },
  subtitle: { type: String, default: "" },
  heroTitle: { type: String, default: "صافي المدفوعات" },
  paymentTotalLabel: { type: String, default: "إجمالي المحصل" },
  loading: { type: Boolean, default: false },
  paymentsTotal: { type: [Number, String], default: 0 },
  refundsTotal: { type: [Number, String], default: 0 },
  heroChips: { type: Array, default: () => [] },
  paymentMethodItems: { type: Array, default: () => [] },
  showOperations: { type: Boolean, default: false },
  stockRows: { type: Array, default: () => [] },
  stockLoading: { type: Boolean, default: false },
  stockError: { type: String, default: "" },
  stockPage: { type: Number, default: 1 },
  stockPageSize: { type: Number, default: 15 },
  stockTotal: { type: Number, default: 0 },
  stockType: { type: String, default: null },
  studentRows: { type: Array, default: () => [] },
  studentLoading: { type: Boolean, default: false },
  studentError: { type: String, default: "" },
  studentPage: { type: Number, default: 1 },
  studentPageSize: { type: Number, default: 15 },
  studentTotal: { type: Number, default: 0 },
  studentType: { type: String, default: null },
});

defineEmits([
  "retry-stock",
  "retry-student",
  "update:stockPage",
  "update:stockType",
  "update:studentPage",
  "update:studentType",
]);

const stockTypeLabels = STOCK_OPERATION_LABELS;
const studentTypeLabels = STUDENT_OPERATION_LABELS;
</script>
