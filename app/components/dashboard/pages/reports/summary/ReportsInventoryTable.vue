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

defineOptions({ name: "ReportsInventoryTable" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);

const props = defineProps({
  byType: { type: Array, default: () => [] },
  books: { type: Object, default: null },
  cards: { type: Object, default: null },
  booklets: { type: Object, default: null },
  loading: { type: Boolean, default: false },
});

const columns = [
  { field: "type", header: "النوع" },
  { field: "total", header: "كل" },
  { field: "reserved", header: "محجوز" },
  { field: "available", header: "متاح بيع مباشر" },
];

const emptyBucket = () => ({ total: 0, reserved: 0, available: 0 });

const rows = computed(() => {
  if (Array.isArray(props.byType) && props.byType.length) {
    return props.byType.map((row) => ({
      type: PRODUCT_TYPE_LABELS[row.type] || row.type || "-",
      total: row.total ?? 0,
      reserved: row.reserved ?? 0,
      available: row.available ?? 0,
    }));
  }

  const books = props.books || emptyBucket();
  const cards = props.cards || emptyBucket();
  const booklets = props.booklets || emptyBucket();

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
