<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span class="text-lg font-bold">الكتب</span>
          <Button label="احجز كتاب 📖" severity="info" @click="navigateToReserve" />
        </div>
      </template>

      <template #content>
        <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <InputText v-model="search" placeholder="🔍 بحث عن كتاب أو أستاذ…" class="w-full max-w-md" />
          <span class="text-sm text-slate-300">إجمالي الكتب: {{ filteredBooks.length }}</span>
        </div>

        <AppDataTable
          :value="filteredBooks"
          :columns="bookColumns"
          :loading="pending"
          :row-class="getBookRowClass"
          empty-message="لا توجد كتب."
          :skeleton-rows="4"
          @row-click="onBookRowClick"
        >
          <template #available="{ data }">
            <span
              class="rounded-full px-2 py-1 text-xs font-semibold"
              :class="data.available ? 'bg-green-700 text-white' : 'bg-red-800 text-white'"
            >
              {{ data.available ? "✔ متاح" : "✖ غير متاح" }}
            </span>
          </template>
        </AppDataTable>

        <p class="mt-4 text-sm text-slate-400">اختيار كتاب + الضغط على زر «احجز كتاب» يفتح صفحة الحجز</p>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import { bookService } from "~/services/bookService";
import { productService } from "~/services/productService";

const pending = ref(true);
const search = ref("");
const selectedId = ref("");
const books = ref([]);

const bookColumns = [
  { field: "title", header: "اسم الكتاب" },
  { field: "teacher", header: "الأستاذ" },
  { field: "stock", header: "العدد" },
  { field: "available", header: "متاح", slot: "available" },
];

const getBookRowClass = (data) =>
  selectedId.value === data.id ? "app-row-matched cursor-pointer" : "cursor-pointer";

const onBookRowClick = (event) => {
  selectedId.value = event?.data?.id || "";
};

const filteredBooks = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return books.value;

  return books.value.filter((book) => `${book.title} ${book.teacher}`.toLowerCase().includes(term));
});

const navigateToReserve = async () => {
  await navigateTo({ path: "/books/reserve", query: selectedId.value ? { book: selectedId.value } : {} });
};

const loadBooks = async () => {
  try {
    const [bookItems, products] = await Promise.all([
      bookService.getBooks(),
      productService.getProducts(),
    ]);

    const bookList = Array.isArray(bookItems) ? bookItems : bookItems?.data || [];
    const productList = Array.isArray(products) ? products : products?.data || [];
    const source = bookList.length ? bookList : productList;

    books.value = source.map((item) => ({
      id: item.id,
      title: item.title || item.name,
      teacher: item.teacher?.name || "-",
      stock: item.stock ?? 0,
      available: item.available ?? Number(item.stock || 0) > 10,
    }));
  } catch (error) {
    console.error("Failed to load books", error);
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  loadBooks();
});
</script>
