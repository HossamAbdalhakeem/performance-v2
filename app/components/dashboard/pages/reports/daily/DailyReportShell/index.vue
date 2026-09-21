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
          title="البيع والحجز"
          subtitle="بيع وحجز"
          empty-message="لا توجد عمليات بيع أو حجز خلال الفترة المحددة."
          variant="sales"
          :type-labels="saleTypeLabels"
          :rows="studentRows"
          :loading="studentLoading"
          :error="studentError"
          :page="studentPage"
          :page-size="studentPageSize"
          :total-records="studentTotal"
          :movement-type="studentType"
          :operation-status="studentStatus"
          :status-options="operationStatusOptions"
          @retry="$emit('retry-student')"
          @update:page="$emit('update:studentPage', $event)"
          @update:movement-type="$emit('update:studentType', $event)"
          @update:operation-status="$emit('update:studentStatus', $event)"
        />

        <DailyReportOperationsSection
          title="الاستبدال"
          subtitle="استبدال منتج قديم بمنتج جديد"
          empty-message="لا توجد عمليات استبدال خلال الفترة المحددة."
          variant="exchanges"
          :type-labels="exchangeTypeLabels"
          :rows="exchangeRows"
          :loading="exchangeLoading"
          :error="exchangeError"
          :page="exchangePage"
          :page-size="exchangePageSize"
          :total-records="exchangeTotal"
          :movement-type="exchangeType"
          @retry="$emit('retry-exchanges')"
          @update:page="$emit('update:exchangePage', $event)"
          @update:movement-type="$emit('update:exchangeType', $event)"
        />

        <DailyReportOperationsSection
          title="الاسترداد والإلغاء"
          subtitle="استرداد ومرتجع وإلغاء حجز"
          empty-message="لا توجد عمليات استرداد أو إلغاء خلال الفترة المحددة."
          variant="refunds"
          :type-labels="refundTypeLabels"
          :filter-labels="refundFilterLabels"
          :rows="adjustmentRows"
          :loading="adjustmentLoading"
          :error="adjustmentError"
          :page="adjustmentPage"
          :page-size="adjustmentPageSize"
          :total-records="adjustmentTotal"
          :movement-type="adjustmentType"
          @retry="$emit('retry-adjustments')"
          @update:page="$emit('update:adjustmentPage', $event)"
          @update:movement-type="$emit('update:adjustmentType', $event)"
        />

        <DailyReportOperationsSection
          title="عمليات المخزن"
          subtitle="إضافة وسحب المخزون"
          empty-message="لا توجد عمليات مخزن خلال الفترة المحددة."
          variant="stock"
          :type-labels="stockTypeLabels"
          :rows="stockRows"
          :loading="stockLoading"
          :error="stockError"
          :page="stockPage"
          :page-size="stockPageSize"
          :total-records="stockTotal"
          :movement-type="stockType"
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
  OPERATION_STATUS_LABELS,
  STOCK_OPERATION_LABELS,
  STUDENT_EXCHANGE_LABELS,
  STUDENT_REFUND_FILTER_LABELS,
  STUDENT_REFUND_LABELS,
  STUDENT_SALE_LABELS,
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
  title: { type: String, default: "التقرير" },
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
  studentStatus: { type: String, default: null },
  exchangeRows: { type: Array, default: () => [] },
  exchangeLoading: { type: Boolean, default: false },
  exchangeError: { type: String, default: "" },
  exchangePage: { type: Number, default: 1 },
  exchangePageSize: { type: Number, default: 15 },
  exchangeTotal: { type: Number, default: 0 },
  exchangeType: { type: String, default: null },
  adjustmentRows: { type: Array, default: () => [] },
  adjustmentLoading: { type: Boolean, default: false },
  adjustmentError: { type: String, default: "" },
  adjustmentPage: { type: Number, default: 1 },
  adjustmentPageSize: { type: Number, default: 15 },
  adjustmentTotal: { type: Number, default: 0 },
  adjustmentType: { type: String, default: null },
});

defineEmits([
  "retry-stock",
  "retry-student",
  "retry-exchanges",
  "retry-adjustments",
  "update:stockPage",
  "update:stockType",
  "update:studentPage",
  "update:studentType",
  "update:studentStatus",
  "update:exchangePage",
  "update:exchangeType",
  "update:adjustmentPage",
  "update:adjustmentType",
]);

const stockTypeLabels = STOCK_OPERATION_LABELS;
const saleTypeLabels = STUDENT_SALE_LABELS;
const operationStatusOptions = Object.entries(OPERATION_STATUS_LABELS).map(
  ([value, label]) => ({ value, label }),
);
const exchangeTypeLabels = STUDENT_EXCHANGE_LABELS;
const refundTypeLabels = STUDENT_REFUND_LABELS;
const refundFilterLabels = STUDENT_REFUND_FILTER_LABELS;
</script>
