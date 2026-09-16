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
          <SearchInput
            v-model="search"
            label=""
            variant="dark"
            placeholder="بحث عن كتاب أو أستاذ…"
            input-class="w-[80%]"
            :throttle-ms="350"
            @search="(term) => searchBooks(term, true)"
          />
          <span class="text-sm text-slate-300 min-w-[110px]"
            >إجمالي الكتب: {{ pagination.total }}</span
          >
        </div>

        <AppDataTable
          :value="books"
          :columns="bookColumns"
          :loading="pending"
          paginator
          lazy
          :rows="pagination.perPage"
          :first="pagination.first"
          :total-records="pagination.total"
          :row-class="getBookRowClass"
          :empty-message="emptyMessage"
          :skeleton-rows="4"
          @row-click="onBookRowClick"
          @page="onPage"
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
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import SearchInput from "~/components/shared/search-input/index.vue";
import { productService } from "~/services/productService";
import { useAppToast } from "~/composables/useAppToast";

const { showError } = useAppToast();
const pending = ref(false);
const search = ref("");
const selectedId = ref("");
const books = ref([]);
const pagination = reactive({
  page: 1,
  perPage: 20,
  total: 0,
  first: 0,
});

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

const searchBooks = async (term = search.value, resetPage = false) => {
  const query = String(term || "").trim();
  if (resetPage) {
    pagination.page = 1;
    pagination.first = 0;
  }
  pending.value = true;

  try {
    const params = {
      page: pagination.page,
      per_page: pagination.perPage,
    };
    if (query) params.search = query;

    const result = await productService.getProducts(params);
    books.value = result.data.map(normalizeBook);
    pagination.total = result.pagination.total;

    if (
      selectedId.value &&
      !books.value.some((book) => book.id === selectedId.value)
    ) {
      selectedId.value = "";
    }
  } catch (error) {
    books.value = [];
    pagination.total = 0;
    showError(error?.message || "تعذر البحث في الكتب.");
  } finally {
    pending.value = false;
  }
};

const onPage = (event) => {
  pagination.page = event.page + 1;
  pagination.perPage = event.rows;
  pagination.first = event.first;
  searchBooks(search.value);
};

onMounted(() => {
  searchBooks("", true);
});
</script>
