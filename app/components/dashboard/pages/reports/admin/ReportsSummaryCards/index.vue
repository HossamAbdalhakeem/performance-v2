<template>
  <section class="space-y-3" dir="rtl">
    <div>
      <h3 class="text-base font-bold text-white">أهم المؤشرات</h3>
      <p class="mt-0.5 text-xs text-slate-400">ملخص سريع للفترة المحددة</p>
    </div>

    <div v-if="loading" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="i in 6"
        :key="`kpi-skel-${i}`"
        class="rounded-xl border border-white/10 bg-slate-900 p-4"
      >
        <Skeleton width="7rem" height="0.9rem" class="mb-3" />
        <Skeleton width="60%" height="1.8rem" />
      </div>
    </div>

    <ReportsSectionError
      v-else-if="error"
      :message="error"
      @retry="reload"
    />

    <div
      v-else
      class="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
    >
      <ReportKpiCard
        compact
        label="إجمالي المبيعات"
        :value="formatMoney(summary.totalSales, 'locale')"
      />
      <ReportKpiCard
        compact
        label="عدد المبيعات"
        :value="summary.salesCount ?? 0"
      />
      <ReportKpiCard
        compact
        label="إجمالي المدفوعات"
        :value="formatMoney(summary.totalPayments, 'locale')"
      />
      <ReportKpiCard
        compact
        label="إجمالي الحجوزات"
        :value="summary.totalReservations ?? 0"
      />
      <ReportKpiCard
        compact
        label="مدفوعات الحجوزات"
        :value="formatMoney(summary.reservationPayments, 'locale')"
      />
      <ReportKpiCard
        compact
        label="المبالغ المستحقة"
        :value="formatMoney(summary.outstandingAmount, 'locale')"
        hint="متبقي على الحجوزات المفتوحة"
      />
    </div>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import ReportKpiCard from "./partials/ReportKpiCard.vue";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";
import { reportService } from "~/services/reportService";
import { formatMoney } from "~/utils/format";
import { useAdminReportSection } from "~/composables/useAdminReportSection";

defineOptions({ name: "ReportsSummaryCards" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => reportService.getAdminSummary(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل بيانات المؤشرات.",
  },
);

const summary = computed(() => data.value || {});
</script>
