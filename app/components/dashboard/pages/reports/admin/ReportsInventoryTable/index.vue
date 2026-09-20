<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <p class="mb-3 font-bold text-white">المخزون</p>

    <div v-if="loading" class="space-y-3">
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Skeleton v-for="i in 5" :key="`inv-kpi-${i}`" height="3.5rem" />
      </div>
      <Skeleton width="100%" height="2.2rem" />
      <Skeleton width="100%" height="2.2rem" />
      <Skeleton width="100%" height="2.2rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل بيانات المخزون."
      @retry="reload"
    />

    <template v-else>
      <div class="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <div
          v-for="kpi in summaryKpis"
          :key="kpi.key"
          class="rounded-lg border border-white/5 bg-slate-950/60 p-3"
        >
          <p class="text-[11px] text-slate-400">{{ kpi.label }}</p>
          <p class="mt-1 text-lg font-bold text-white">{{ kpi.value }}</p>
        </div>
      </div>

      <AppDataTable
        :value="rows"
        :columns="columns"
        empty-message="لا توجد بيانات مخزون."
      />
    </template>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { PRODUCT_TYPE_LABELS, ProductType } from "~/enums/productType";
import { reportService } from "~/services/reportService";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";

defineOptions({ name: "ReportsInventoryTable" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => reportService.getAdminInventory(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل بيانات المخزون.",
  },
);

const columns = [
  { field: "type", header: "النوع" },
  { field: "total", header: "كل" },
  { field: "reserved", header: "محجوز" },
  { field: "available", header: "متاح" },
];

const summary = computed(() => data.value?.summary || {});

const summaryKpis = computed(() => [
  { key: "total", label: "الإجمالي", value: summary.value.total ?? 0 },
  { key: "reserved", label: "محجوز", value: summary.value.reserved ?? 0 },
  { key: "available", label: "متاح", value: summary.value.available ?? 0 },
  { key: "lowStock", label: "مخزون منخفض", value: summary.value.lowStock ?? 0 },
  {
    key: "outOfStock",
    label: "نفد المخزون",
    value: summary.value.outOfStock ?? 0,
  },
]);

const emptyBucket = () => ({ total: 0, reserved: 0, available: 0 });

const rows = computed(() => {
  const inventory = data.value || {};
  if (Array.isArray(inventory.byType) && inventory.byType.length) {
    return inventory.byType.map((row) => ({
      type: PRODUCT_TYPE_LABELS[row.type] || row.type || "-",
      total: row.total ?? 0,
      reserved: row.reserved ?? 0,
      available: row.available ?? 0,
    }));
  }

  const books = inventory.books || emptyBucket();
  const cards = inventory.cards || emptyBucket();
  const booklets = inventory.booklets || emptyBucket();

  return [
    {
      type: PRODUCT_TYPE_LABELS[ProductType.BOOK],
      total: books.total ?? 0,
      reserved: books.reserved ?? 0,
      available: books.available ?? 0,
    },
    {
      type: PRODUCT_TYPE_LABELS[ProductType.CARD],
      total: cards.total ?? 0,
      reserved: cards.reserved ?? 0,
      available: cards.available ?? 0,
    },
    {
      type: PRODUCT_TYPE_LABELS[ProductType.BOOKLET],
      total: booklets.total ?? 0,
      reserved: booklets.reserved ?? 0,
      available: booklets.available ?? 0,
    },
  ];
});
</script>
