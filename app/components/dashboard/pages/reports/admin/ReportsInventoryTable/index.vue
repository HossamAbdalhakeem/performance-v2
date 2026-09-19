<template>
  <div class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4">
    <p class="mb-3 font-bold text-white">المخزون حسب النوع</p>
    <div v-if="loading" class="space-y-2">
      <Skeleton width="100%" height="2.2rem" />
      <Skeleton width="100%" height="2.2rem" />
      <Skeleton width="100%" height="2.2rem" />
    </div>
    <AppDataTable
      v-else
      :value="rows"
      :columns="columns"
      empty-message="لا توجد بيانات مخزون."
    />
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { PRODUCT_TYPE_LABELS, ProductType } from "~/enums/productType";
import { reportService } from "~/services/reportService";
import { useAdminReportSection } from "~/composables/useAdminReportSection";

defineOptions({ name: "ReportsInventoryTable" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data } = useAdminReportSection(
  (params) => reportService.getAdminInventory(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
  },
);

const columns = [
  { field: "type", header: "النوع" },
  { field: "total", header: "كل" },
  { field: "reserved", header: "محجوز" },
  { field: "available", header: "متاح بيع مباشر" },
];

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
