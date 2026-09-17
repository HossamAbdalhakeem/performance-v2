<template>
  <DailyReportShell
    title="تقرير خدمة العملاء"
    subtitle="نشاطك عبر كل الفروع — اضغط أي بطاقة لعرض التفاصيل"
    hero-title="مدفوعات حجوزاتك"
    payment-total-label="إجمالي المحصل"
    activity-title="توزيع حجوزاتك ونشاطك"
    :loading="loading"
    :date-from="dateFrom"
    :date-to="dateTo"
    :payments-total="summary.paymentsTotal ?? 0"
    :refunds-total="Number(summary.refundsTotal || 0)"
    :hero-chips="heroChips"
    :payment-method-items="paymentMethodItems"
    :activity-metrics="activityMetrics"
    :activity="summary.activity"
    :detail-visible="detailVisible"
    :detail-loading="detailLoading"
    :active-detail-key="activeDetailKey"
    :active-detail-rows="activeDetailRows"
    :is-customer-service="true"
    @update:date-from="dateFrom = $event"
    @update:date-to="dateTo = $event"
    @update:detail-visible="detailVisible = $event"
    @date-change="onDateRangeChange"
    @refresh="loadReport"
    @open-detail="openDetail"
    @close-detail="closeDetail"
  />
</template>

<script setup>
import {
  buildCustomerServiceActivityMetrics,
  buildCustomerServiceHeroChips,
} from "~/utils/dailyReportMetrics";
import { useDailyReportPage } from "~/composables/useDailyReportPage";

defineOptions({ name: "CustomerServiceReportsPage" });

const DailyReportShell = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reports/daily/DailyReportShell.vue"),
);

const {
  loading,
  detailLoading,
  summary,
  paymentMethodItems,
  dateFrom,
  dateTo,
  detailVisible,
  activeDetailKey,
  activeDetailRows,
  openDetail,
  closeDetail,
  loadReport,
  onDateRangeChange,
} = useDailyReportPage();

const heroChips = computed(() =>
  buildCustomerServiceHeroChips(summary.value),
);
const activityMetrics = computed(() =>
  buildCustomerServiceActivityMetrics(summary.value),
);

onMounted(loadReport);
</script>
