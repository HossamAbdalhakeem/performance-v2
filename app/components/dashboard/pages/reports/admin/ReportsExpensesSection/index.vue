<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <div class="mb-4">
      <p class="font-bold text-white">المصروفات</p>
      <p class="mt-1 text-xs text-slate-400">
        تفصل المصروفات المرتبطة بالمبيعات عن المصروفات العامة
      </p>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Skeleton v-for="i in 3" :key="`exp-${i}`" height="4.5rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل بيانات المصروفات."
      @retry="reload"
    />

    <template v-else>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ReportsFinancialMetricCard
          label="إجمالي المصروفات"
          :value="formatMoney(expenses.totalExpenses, 'locale')"
          value-class="text-amber-200"

        />
        <!-- <ReportsFinancialMetricCard
          label="مصروفات مرتبطة بالمبيعات"
          :value="formatMoney(expenses.salesRelatedExpenses, 'locale')"
          value-class="text-amber-200"
        /> -->
       
      </div>

      <div
        v-if="byBranch.length"
        class="mt-4 overflow-hidden rounded-lg border border-white/5"
      >
        <AppDataTable
          :value="byBranch"
          :columns="branchColumns"
          empty-message="لا توجد مصروفات حسب الفرع."
        />
      </div>
    </template>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format";
import { reportService } from "~/services/reportService";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsFinancialMetricCard from "~/components/dashboard/pages/reports/admin/ReportsFinancialsSection/partials/ReportsFinancialMetricCard.vue";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";

defineOptions({ name: "ReportsExpensesSection" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => reportService.getAdminExpenses(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل بيانات المصروفات.",
  },
);

const expenses = computed(() => data.value || {});

const branchColumns = [
  { field: "branchName", header: "الفرع / النوع" },
  { field: "amountLabel", header: "المبلغ" },
];

const byBranch = computed(() =>
  (Array.isArray(data.value?.expensesByBranch)
    ? data.value.expensesByBranch
    : []
  ).map((row) => ({
    ...row,
    amountLabel: formatMoney(row.amount, "locale"),
  })),
);
</script>
