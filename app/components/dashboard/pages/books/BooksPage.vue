<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div
          class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <span class="text-lg font-bold">الكتب</span>
          <Button
            label="احجز كتاب 📖"
            severity="info"
            @click="navigateToReserve"
          />
        </div>
      </template>

      <template #content>
        <div
          class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <InputText
            v-model="search"
            placeholder="🔍 بحث عن كتاب أو أستاذ…"
            class="w-[80%] rounded-xl border border-slate-700 bg-slate-900  text-right text-slate-100 placeholder:text-slate-400"
            @update:modelValue="onSearchInput"
          />
          <span class="text-sm text-slate-300 min-w-[110px]"
            >إجمالي الكتب: {{ books.length }}</span
          >
        </div>

        <p
          v-if="errorMessage"
          class="mb-3 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-300"
        >
          {{ errorMessage }}
        </p>

        <AppDataTable
          :value="books"
          :columns="bookColumns"
          :loading="pending"
          :row-class="getBookRowClass"
          :empty-message="emptyMessage"
          :skeleton-rows="4"
          @row-click="onBookRowClick"
        >
          <template #status="{ data }">
            <span
              class="rounded-full px-2 py-1 text-xs font-semibold"
              :class="statusBadgeClass(data.status)"
            >
              {{ data.statusLabel }}
            </span>
          </template>
        </AppDataTable>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import { productService } from "~/services/productService";
import { useThrottledCallback } from "~/composables/useThrottledCallback";

const pending = ref(false);
const search = ref("");
const selectedId = ref("");
const books = ref([]);
const errorMessage = ref("");

const STATUS_META = {
  AVAILABLE: { label: "متاح", className: "bg-green-700 text-white" },
  ACTIVE: { label: "متاح", className: "bg-green-700 text-white" },
  UPCOMING: { label: "قادم", className: "bg-amber-600 text-white" },
  INACTIVE: { label: "غير متاح", className: "bg-red-800 text-white" },
  OUT_OF_STOCK: { label: "غير متوفر", className: "bg-red-800 text-white" },
};

const bookColumns = [
  { field: "title", header: "اسم الكتاب" },
  { field: "teacher", header: "الأستاذ" },
  { field: "sellingPriceLabel", header: "سعر البيع" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
];

const emptyMessage = computed(() =>
  search.value.trim() ? "لا توجد كتب مطابقة" : "لا توجد كتب."
);

const statusBadgeClass = (status) =>
  STATUS_META[status]?.className || "bg-slate-600 text-white";

const getBookRowClass = (data) =>
  selectedId.value === data.id
    ? "app-row-matched cursor-pointer"
    : "cursor-pointer";

const onBookRowClick = (event) => {
  selectedId.value = event?.data?.id || "";
};

const navigateToReserve = async () => {
  await navigateTo({
    path: "/books/reserve",
    query: selectedId.value ? { book: selectedId.value } : {},
  });
};

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} ج.م`;

const normalizeBook = (item) => {
  const status = String(item.status || "").toUpperCase();
  const meta = STATUS_META[status] || {
    label: item.status || "-",
    className: "bg-slate-600 text-white",
  };

  return {
    id: item.id,
    title: item.title || item.name || "-",
    teacher: item.teacher?.name || "-",
    sellingPrice: item.sellingPrice,
    sellingPriceLabel: formatMoney(item.sellingPrice),
    status,
    statusLabel: meta.label,
    reservationAllowed: Boolean(item.reservationAllowed),
  };
};

const searchBooks = async (term = "") => {
  const query = String(term || "").trim();
  pending.value = true;
  errorMessage.value = "";

  try {
    const params = {};
    if (query) params.search = query;

    const items = await productService.getProducts(params);
    const list = Array.isArray(items) ? items : items?.data || [];
    books.value = list.map(normalizeBook);

    if (
      selectedId.value &&
      !books.value.some((book) => book.id === selectedId.value)
    ) {
      selectedId.value = "";
    }
  } catch (error) {
    books.value = [];
    errorMessage.value = error?.message || "تعذر البحث في الكتب.";
  } finally {
    pending.value = false;
  }
};

const { run: runSearch } = useThrottledCallback((term) => {
  searchBooks(term);
}, 350);

const onSearchInput = (value) => {
  runSearch(value || "");
};

onMounted(() => {
  searchBooks("");
});
</script>
