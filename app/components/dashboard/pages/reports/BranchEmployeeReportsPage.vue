<template>
  <DailyReportShell
    title="تقرير اليوم"
    subtitle="نظرة سريعة على نشاط الفرع — اضغط أي بطاقة لعرض التفاصيل"
    hero-title="صافي المدفوعات"
    :loading="loading"
    :date-from="dateFrom"
    :date-to="dateTo"
    :payments-total="summary.paymentsTotal"
    :refunds-total="Number(summary.refundsTotal || 0)"
    :hero-chips="heroChips"
    :payment-method-items="paymentMethodItems"
    :activity-metrics="activityMetrics"
    :activity="summary.activity"
    :detail-visible="detailVisible"
    :detail-loading="detailLoading"
    :active-detail-key="activeDetailKey"
    :active-detail-rows="activeDetailRows"
    :is-customer-service="false"
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
  buildBranchActivityMetrics,
  buildBranchHeroChips,
} from "~/utils/dailyReportMetrics";
import { useDailyReportPage } from "~/composables/useDailyReportPage";

defineOptions({ name: "BranchEmployeeReportsPage" });

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

const heroChips = computed(() => buildBranchHeroChips(summary.value));
const activityMetrics = computed(() =>
  buildBranchActivityMetrics(summary.value),
);

onMounted(loadReport);
</script>
