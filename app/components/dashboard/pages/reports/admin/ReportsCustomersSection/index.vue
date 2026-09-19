<template>
  <div
    v-if="loading"
    class="rounded-xl border border-white/10 bg-slate-900 p-4"
  >
    <Skeleton width="8rem" height="1rem" class="mb-4" />
    <div class="grid gap-4 xl:grid-cols-2">
      <Skeleton height="12rem" />
      <Skeleton height="12rem" />
    </div>
  </div>
  <div
    v-else
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
  >
    <p class="mb-4 font-bold text-white">طلاب وعملاء</p>
    <div class="grid w-full min-w-0 gap-6 xl:grid-cols-2">
      <div class="min-w-0 overflow-x-auto">
        <p class="mb-3 text-center text-sm font-semibold text-white">
          عدد العملاء لكل سنة دراسية
        </p>
        <CustomersByYearChart :labels="yearLabels" :values="yearValues" />
      </div>

      <div class="min-w-0 overflow-x-auto">
        <p class="mb-3 text-center text-sm font-semibold text-white">
          طلاب كل مدرس
        </p>
        <AppDataTable
          :value="students"
          :columns="studentColumns"
          empty-message="لا توجد بيانات طلاب في هذه الفترة."
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { reportService } from "~/services/reportService";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import { UNSPECIFIED_LABEL } from "~/utils/domainLabels";

defineOptions({ name: "ReportsCustomersSection" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);
const CustomersByYearChart = defineAsyncComponent(() =>
  import("~/components/shared/customers-by-year-chart/index.vue"),
);

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data } = useAdminReportSection(
  (params) => reportService.getAdminCustomers(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
  },
);

const yearLabels = computed(() =>
  (data.value?.customersByYear || []).map((row) =>
    row.label === "unspecified" || !row.label ? UNSPECIFIED_LABEL : row.label,
  ),
);

const yearValues = computed(() =>
  (data.value?.customersByYear || []).map((row) => Number(row.value || 0)),
);

const students = computed(() =>
  Array.isArray(data.value?.studentPurchases)
    ? data.value.studentPurchases
    : [],
);

const studentColumns = [
  { field: "student", header: "اسم الطالب" },
  { field: "teacher", header: "المدرس" },
  { field: "phone", header: "الموبايل" },
  { field: "product", header: "اشترى ايه" },
];
</script>
