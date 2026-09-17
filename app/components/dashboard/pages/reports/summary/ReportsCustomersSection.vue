<template>
  <div class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4">
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
defineOptions({ name: "ReportsCustomersSection" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);
const CustomersByYearChart = defineAsyncComponent(() =>
  import("~/components/shared/customers-by-year-chart/index.vue"),
);

defineProps({
  yearLabels: { type: Array, default: () => [] },
  yearValues: { type: Array, default: () => [] },
  students: { type: Array, default: () => [] },
});

const studentColumns = [
  { field: "student", header: "اسم الطالب" },
  { field: "teacher", header: "المدرس" },
  { field: "phone", header: "الموبايل" },
  { field: "product", header: "اشترى ايه" },
];
</script>
